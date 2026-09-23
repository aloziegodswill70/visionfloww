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

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
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

    const { id } =
      await context.params;

    const account =
      await prisma.whatsAppAccount.findFirst({
        where: {
          id,
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
      });

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp account not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error(
      "GET /api/whatsapp/accounts/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load WhatsApp account.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * PUT
 * =========================================================
 *
 * Allows a clinic administrator to:
 *
 * - Change branch
 * - Change display name
 * - Update phone number
 * - Update business account ID
 * - Replace access token
 * - Reconnect account
 */
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const user =
      await requireClinicUser();

    if (!isClinicAdmin(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only clinic administrators can update WhatsApp accounts.",
        },
        { status: 403 }
      );
    }

    const { id } =
      await context.params;

    const existing =
      await prisma.whatsAppAccount.findFirst({
        where: {
          id,
          clinicId: user.clinicId,
        },
        select: {
          id: true,
          clinicId: true,
          phoneNumberId: true,
          accessTokenEncrypted: true,
          branchId: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp account not found.",
        },
        { status: 404 }
      );
    }

    const body =
      await request.json();

    const branchId =
      normalize(body.branchId);

    const phoneNumber =
      normalize(body.phoneNumber);

    const displayName =
      normalize(body.displayName);

    const businessAccountId =
      normalize(
        body.businessAccountId
      );

    const accessToken =
      normalize(body.accessToken);

    const status =
      normalize(body.status);

    /**
     * -------------------------------------------------------
     * Validate branch
     * -------------------------------------------------------
     */
    let validatedBranchId:
      | string
      | null
      | undefined;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "branchId"
      )
    ) {
      validatedBranchId =
        branchId || null;

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
      }
    }

    /**
     * -------------------------------------------------------
     * Validate status
     * -------------------------------------------------------
     */
    const allowedStatuses = [
      "pending",
      "connected",
      "disconnected",
      "error",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid WhatsApp account status.",
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
     * If access token is being replaced,
     * verify it against Meta first.
     * -------------------------------------------------------
     */
    let encryptedToken:
      | string
      | undefined;

    let verifiedPhoneNumber:
      | string
      | undefined;

    let verifiedDisplayName:
      | string
      | undefined;

            if (accessToken) {
        if (!existing.phoneNumberId) {
            return NextResponse.json(
            {
                success: false,
                message:
                "This WhatsApp account does not have a Phone Number ID configured.",
            },
            { status: 400 }
            );
        }

        const metaPhone =
            await getWhatsAppPhoneNumber(
            existing.phoneNumberId,
            accessToken
            );

        encryptedToken =
            encryptSecret(accessToken);

        verifiedPhoneNumber =
            metaPhone.display_phone_number;

        verifiedDisplayName =
            metaPhone.verified_name;
        }

    /**
     * -------------------------------------------------------
     * Build update
     * -------------------------------------------------------
     */
    const data: {
      branchId?: string | null;
      phoneNumber?: string | null;
      displayName?: string | null;
      businessAccountId?: string | null;
      accessTokenEncrypted?: string;
      verifyTokenHash?: string;
      status?: string;
      lastConnectedAt?: Date;
    } = {};

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "branchId"
      )
    ) {
      data.branchId =
        validatedBranchId ?? null;
    }

    if (phoneNumber) {
      data.phoneNumber =
        phoneNumber;
    } else if (
      verifiedPhoneNumber
    ) {
      data.phoneNumber =
        verifiedPhoneNumber;
    }

    if (displayName) {
      data.displayName =
        displayName;
    } else if (
      verifiedDisplayName
    ) {
      data.displayName =
        verifiedDisplayName;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "businessAccountId"
      )
    ) {
      data.businessAccountId =
        businessAccountId || null;
    }

    if (encryptedToken) {
      data.accessTokenEncrypted =
        encryptedToken;

      data.verifyTokenHash =
        hashVerifyToken(
          verifyToken
        );

      data.status =
        "connected";

      data.lastConnectedAt =
        new Date();
    }

    if (status) {
      data.status = status;

      if (status === "connected") {
        data.lastConnectedAt =
          new Date();
      }
    }

    const account =
      await prisma.whatsAppAccount.update({
        where: {
          id: existing.id,
        },
        data,
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
      });

    await prisma.auditLog.create({
      data: {
        clinicId:
          user.clinicId,
        userId:
          user.id,
        action:
          "UPDATE",
        entity:
          "WhatsAppAccount",
        entityId:
          account.id,
        description:
          `WhatsApp account ${account.phoneNumberId} was updated.`,
      },
    });

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error(
      "PUT /api/whatsapp/accounts/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update WhatsApp account.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * DELETE
 * =========================================================
 *
 * Disconnects the account.
 *
 * We intentionally DO NOT physically delete the record.
 *
 * This preserves:
 * - WhatsApp message history
 * - audit trail
 * - execution logs
 * - clinic configuration history
 */
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const user =
      await requireClinicUser();

    if (!isClinicAdmin(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only clinic administrators can disconnect WhatsApp accounts.",
        },
        { status: 403 }
      );
    }

    const { id } =
      await context.params;

    const account =
      await prisma.whatsAppAccount.findFirst({
        where: {
          id,
          clinicId: user.clinicId,
        },
        select: {
          id: true,
          phoneNumberId: true,
        },
      });

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp account not found.",
        },
        { status: 404 }
      );
    }

    await prisma.whatsAppAccount.update({
      where: {
        id: account.id,
      },
      data: {
        status: "disconnected",
        accessTokenEncrypted: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        clinicId:
          user.clinicId,
        userId:
          user.id,
        action:
          "DISCONNECT",
        entity:
          "WhatsAppAccount",
        entityId:
          account.id,
        description:
          `WhatsApp account ${account.phoneNumberId} was disconnected.`,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "WhatsApp account disconnected successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/whatsapp/accounts/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to disconnect WhatsApp account.",
      },
      { status: 500 }
    );
  }
}