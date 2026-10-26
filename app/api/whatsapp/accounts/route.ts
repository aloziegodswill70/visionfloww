import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireClinicUser } from "@/lib/auth-helpers";

import {
  encryptSecret,
  hashVerifyToken,
} from "@/lib/whatsapp/security";

import {
  getWhatsAppPhoneNumber,
} from "@/lib/whatsapp/meta";

export const runtime = "nodejs";

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function normalize(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isClinicAdmin(role: string): boolean {
  return role === UserRole.CLINIC_ADMIN;
}

/**
 * =========================================================
 * GET
 * =========================================================
 *
 * Returns all WhatsApp account records belonging to the
 * current clinic.
 *
 * IMPORTANT:
 * - Access tokens are NEVER returned.
 * - Disconnected historical records may still be returned.
 * - Only one account should normally have status "connected".
 */
export async function GET() {
  try {
    const user = await requireClinicUser();

    if (!isClinicAdmin(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only clinic administrators can manage WhatsApp accounts.",
        },
        { status: 403 }
      );
    }

    const accounts =
      await prisma.whatsAppAccount.findMany({
        where: {
          clinicId: user.clinicId,
        },

        select: {
          id: true,
          clinicId: true,
          branchId: true,
          provider: true,
          phoneNumber: true,
          displayName: true,
          phoneNumberId: true,
          businessAccountId: true,
          status: true,
          lastConnectedAt: true,
          lastWebhookAt: true,
          createdAt: true,
          updatedAt: true,

          branch: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error(
      "GET /api/whatsapp/accounts error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load WhatsApp accounts.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * POST
 * =========================================================
 *
 * Connect or reconnect a Meta WhatsApp Cloud API account.
 *
 * CURRENT MVP RULE:
 *
 * One clinic = ONE connected WhatsApp account.
 *
 * Therefore:
 *
 * 1. If the clinic has no connected account:
 *    -> create the account.
 *
 * 2. If the clinic already has the SAME phoneNumberId:
 *    -> update/reconnect the existing account.
 *
 * 3. If the clinic already has a DIFFERENT connected account:
 *    -> reject with HTTP 409.
 *
 * Disconnected historical accounts do not prevent a new
 * connected account from being created.
 *
 * Required:
 * - phoneNumberId
 * - accessToken
 *
 * Optional:
 * - businessAccountId
 * - phoneNumber
 * - displayName
 * - branchId
 */
export async function POST(request: Request) {
  try {
    const user = await requireClinicUser();

    /**
     * -------------------------------------------------------
     * Clinic administrator only
     * -------------------------------------------------------
     */
    if (!isClinicAdmin(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only clinic administrators can connect WhatsApp accounts.",
        },
        { status: 403 }
      );
    }

    /**
     * -------------------------------------------------------
     * Parse request body
     * -------------------------------------------------------
     */
    const body = await request.json();

    const phoneNumberId =
      normalize(body.phoneNumberId);

    const accessToken =
      normalize(body.accessToken);

    const businessAccountId =
      normalize(body.businessAccountId);

    const suppliedPhoneNumber =
      normalize(body.phoneNumber);

    const suppliedDisplayName =
      normalize(body.displayName);

    const branchId =
      normalize(body.branchId);

    /**
     * -------------------------------------------------------
     * Validate required fields
     * -------------------------------------------------------
     */
    if (!phoneNumberId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp Phone Number ID is required.",
        },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp access token is required.",
        },
        { status: 400 }
      );
    }

    /**
     * -------------------------------------------------------
     * Global webhook verification token
     * -------------------------------------------------------
     *
     * This is the server-side verification token used by
     * Meta when verifying the webhook.
     */
    const verifyToken =
      process.env.WHATSAPP_VERIFY_TOKEN?.trim();

    if (!verifyToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WHATSAPP_VERIFY_TOKEN is not configured on the server.",
        },
        { status: 500 }
      );
    }

    /**
     * -------------------------------------------------------
     * Validate branch
     * -------------------------------------------------------
     *
     * branchId is optional.
     *
     * If supplied, it must belong to the current clinic
     * and must be active.
     */
    let validatedBranchId:
      | string
      | null = null;

    if (branchId) {
      const branch =
        await prisma.branch.findFirst({
          where: {
            id: branchId,
            clinicId: user.clinicId,
            isActive: true,
          },

          select: {
            id: true,
          },
        });

      if (!branch) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Branch not found, inactive, or does not belong to your clinic.",
          },
          { status: 400 }
        );
      }

      validatedBranchId = branch.id;
    }

    /**
     * -------------------------------------------------------
     * Verify the Phone Number directly with Meta
     * -------------------------------------------------------
     *
     * This confirms that:
     *
     * - phoneNumberId exists
     * - accessToken is valid
     * - Meta allows the token to access this number
     *
     * IMPORTANT:
     * Never log the access token.
     */
    const metaPhone =
      await getWhatsAppPhoneNumber(
        phoneNumberId,
        accessToken
      );

    /**
     * -------------------------------------------------------
     * Find an existing record for this phone number
     * -------------------------------------------------------
     *
     * phoneNumberId is globally unique in Prisma.
     */
    const existing =
      await prisma.whatsAppAccount.findUnique({
        where: {
          phoneNumberId,
        },

        select: {
          id: true,
          clinicId: true,
          status: true,
          phoneNumberId: true,
        },
      });

    /**
     * -------------------------------------------------------
     * Prevent cross-clinic ownership
     * -------------------------------------------------------
     *
     * A WhatsApp phone number must never be silently moved
     * from one clinic to another.
     */
    if (
      existing &&
      existing.clinicId !== user.clinicId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This WhatsApp phone number is already connected to another clinic.",
        },
        { status: 409 }
      );
    }

    /**
     * -------------------------------------------------------
     * ONE CLINIC = ONE CONNECTED WHATSAPP ACCOUNT
     * -------------------------------------------------------
     *
     * Check whether this clinic already has another
     * connected account.
     *
     * We only check status = "connected".
     *
     * Therefore disconnected historical accounts do not
     * block the clinic from connecting a new number.
     */
    const connectedAccount =
      await prisma.whatsAppAccount.findFirst({
        where: {
          clinicId: user.clinicId,
          status: "connected",
          accessTokenEncrypted: {
            not: null,
          },
          phoneNumberId: {
            not: null,
          },

          /**
           * If an existing record represents the same
           * phone number, it is allowed to reconnect/update.
           *
           * If it is a different phone number, the clinic
           * already has its one allowed connected account.
           */
          ...(existing
            ? {
                id: {
                  not: existing.id,
                },
              }
            : {}),
        },

        select: {
          id: true,
          phoneNumber: true,
          displayName: true,
          phoneNumberId: true,
          status: true,
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    /**
     * -------------------------------------------------------
     * Reject second connected account
     * -------------------------------------------------------
     */
    if (connectedAccount) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your clinic already has a connected WhatsApp account. Please disconnect the existing WhatsApp account before connecting another number.",
        },
        { status: 409 }
      );
    }

    /**
     * -------------------------------------------------------
     * Encrypt sensitive credentials
     * -------------------------------------------------------
     *
     * The raw access token is NEVER stored.
     */
    const accessTokenEncrypted =
      encryptSecret(accessToken);

    const verifyTokenHash =
      hashVerifyToken(verifyToken);

    /**
     * -------------------------------------------------------
     * Resolve account information
     * -------------------------------------------------------
     */
    const phoneNumber =
      suppliedPhoneNumber ||
      metaPhone.display_phone_number ||
      null;

    const displayName =
      suppliedDisplayName ||
      metaPhone.verified_name ||
      null;

    /**
     * -------------------------------------------------------
     * Create / update WhatsApp account
     * -------------------------------------------------------
     *
     * Existing record:
     * - reconnect
     * - refresh token
     * - refresh metadata
     * - set status connected
     *
     * No existing record:
     * - create new account
     */
    const account = existing
      ? await prisma.whatsAppAccount.update({
          where: {
            id: existing.id,
          },

          data: {
            clinicId:
              user.clinicId,

            branchId:
              validatedBranchId,

            provider:
              "meta_cloud_api",

            phoneNumber,

            displayName,

            phoneNumberId,

            businessAccountId:
              businessAccountId ||
              undefined,

            accessTokenEncrypted,

            verifyTokenHash,

            status:
              "connected",

            lastConnectedAt:
              new Date(),
          },

          select: {
            id: true,
            clinicId: true,
            branchId: true,
            provider: true,
            phoneNumber: true,
            displayName: true,
            phoneNumberId: true,
            businessAccountId: true,
            status: true,
            lastConnectedAt: true,
            lastWebhookAt: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      : await prisma.whatsAppAccount.create({
          data: {
            clinicId:
              user.clinicId,

            branchId:
              validatedBranchId,

            provider:
              "meta_cloud_api",

            phoneNumber,

            displayName,

            phoneNumberId,

            businessAccountId:
              businessAccountId ||
              null,

            accessTokenEncrypted,

            verifyTokenHash,

            status:
              "connected",

            lastConnectedAt:
              new Date(),
          },

          select: {
            id: true,
            clinicId: true,
            branchId: true,
            provider: true,
            phoneNumber: true,
            displayName: true,
            phoneNumberId: true,
            businessAccountId: true,
            status: true,
            lastConnectedAt: true,
            lastWebhookAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

    /**
     * -------------------------------------------------------
     * Audit trail
     * -------------------------------------------------------
     */
    await prisma.auditLog.create({
      data: {
        clinicId:
          user.clinicId,

        userId:
          user.id,

        action:
          existing
            ? "UPDATE"
            : "CREATE",

        entity:
          "WhatsAppAccount",

        entityId:
          account.id,

        description:
          existing
            ? `WhatsApp account ${phoneNumberId} was reconnected.`
            : `WhatsApp account ${phoneNumberId} was connected.`,
      },
    });

    /**
     * -------------------------------------------------------
     * Response
     * -------------------------------------------------------
     *
     * No access token is returned.
     */
    return NextResponse.json(
      {
        success: true,
        account,
      },
      {
        status:
          existing
            ? 200
            : 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/whatsapp/accounts error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect WhatsApp account.",
      },
      { status: 500 }
    );
  }
}

