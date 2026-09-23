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

function normalize(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isClinicAdmin(
  role: string
): boolean {
  return role === UserRole.CLINIC_ADMIN;
}

/**
 * =========================================================
 * GET
 * =========================================================
 *
 * Returns connected WhatsApp accounts.
 *
 * IMPORTANT:
 * Access tokens are NEVER returned.
 */
export async function GET() {
  try {
    const user =
      await requireClinicUser();

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
 * Connects a Meta WhatsApp Cloud API account.
 *
 * Required:
 *
 * phoneNumberId
 * accessToken
 *
 * Optional:
 *
 * businessAccountId
 * phoneNumber
 * displayName
 * branchId
 */
export async function POST(
  request: Request
) {
  try {
    const user =
      await requireClinicUser();

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

    const body =
      await request.json();

    const phoneNumberId =
      normalize(body.phoneNumberId);

    const accessToken =
      normalize(body.accessToken);

    const businessAccountId =
      normalize(
        body.businessAccountId
      );

    const suppliedPhoneNumber =
      normalize(body.phoneNumber);

    const suppliedDisplayName =
      normalize(body.displayName);

    const branchId =
      normalize(body.branchId);

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

      validatedBranchId =
        branch.id;
    }

    /**
     * -------------------------------------------------------
     * Verify credentials directly with Meta
     * -------------------------------------------------------
     */
    const metaPhone =
      await getWhatsAppPhoneNumber(
        phoneNumberId,
        accessToken
      );

    /**
     * -------------------------------------------------------
     * Prevent cross-tenant account ownership
     * -------------------------------------------------------
     */
    const existing =
      await prisma.whatsAppAccount.findUnique(
        {
          where: {
            phoneNumberId,
          },
          select: {
            id: true,
            clinicId: true,
          },
        }
      );

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
     * Encrypt access token
     * -------------------------------------------------------
     */
    const accessTokenEncrypted =
      encryptSecret(accessToken);

    const verifyTokenHash =
      hashVerifyToken(verifyToken);

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
     * Create / update account
     * -------------------------------------------------------
     */
    const account =
      existing
        ? await prisma.whatsAppAccount.update(
            {
              where: {
                id: existing.id,
              },
              data: {
                branchId:
                  validatedBranchId,
                provider:
                  "meta_cloud_api",
                phoneNumber,
                displayName,
                businessAccountId:
                  businessAccountId ||
                  undefined,
                accessTokenEncrypted,
                verifyTokenHash,
                status: "connected",
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
            }
          )
        : await prisma.whatsAppAccount.create(
            {
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
                status: "connected",
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
            }
          );

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

    return NextResponse.json(
      {
        success: true,
        account,
      },
      {
        status: existing
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