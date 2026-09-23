import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  buildWhatsAppPhoneVariants,
  normalizeWhatsAppPhone,
} from "@/lib/whatsapp/meta";

import {
  verifyMetaWebhookSignature,
} from "@/lib/whatsapp/security";

export const runtime = "nodejs";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

interface MetaContact {
  wa_id?: string;
  profile?: {
    name?: string;
  };
}

interface MetaMessage {
  from?: string;
  id?: string;
  timestamp?: string;
  type?: string;

  text?: {
    body?: string;
  };

  button?: {
    text?: string;
  };

  interactive?: {
    type?: string;

    button_reply?: {
      id?: string;
      title?: string;
    };

    list_reply?: {
      id?: string;
      title?: string;
      description?: string;
    };
  };

  image?: {
    caption?: string;
  };

  video?: {
    caption?: string;
  };

  document?: {
    filename?: string;
    caption?: string;
  };
}

interface MetaStatus {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
  errors?: Array<{
    code?: number;
    title?: string;
    message?: string;
  }>;
}

interface MetaWebhookValue {
  messaging_product?: string;

  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };

  contacts?: MetaContact[];

  messages?: MetaMessage[];

  statuses?: MetaStatus[];
}

interface MetaWebhookChange {
  field?: string;
  value?: MetaWebhookValue;
}

interface MetaWebhookEntry {
  id?: string;
  changes?: MetaWebhookChange[];
}

interface MetaWebhookPayload {
  object?: string;
  entry?: MetaWebhookEntry[];
}

/**
 * =========================================================
 * WEBHOOK VERIFICATION
 * =========================================================
 *
 * Meta calls:
 *
 * GET /api/whatsapp/webhook
 *
 * with:
 *
 * hub.mode
 * hub.verify_token
 * hub.challenge
 */
export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(request.url);

    const mode =
      url.searchParams.get(
        "hub.mode"
      );

    const token =
      url.searchParams.get(
        "hub.verify_token"
      );

    const challenge =
      url.searchParams.get(
        "hub.challenge"
      );

    const expectedToken =
      process.env.WHATSAPP_VERIFY_TOKEN?.trim();

    if (!expectedToken) {
      console.error(
        "WHATSAPP_VERIFY_TOKEN is not configured."
      );

      return new NextResponse(
        "Webhook verification token is not configured.",
        {
          status: 500,
        }
      );
    }

    if (
      mode !== "subscribe" ||
      !token ||
      token !== expectedToken ||
      !challenge
    ) {
      return new NextResponse(
        "Forbidden",
        {
          status: 403,
        }
      );
    }

    /**
     * Meta expects the challenge as plain text.
     */
    return new NextResponse(
      challenge,
      {
        status: 200,
        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/whatsapp/webhook error:",
      error
    );

    return new NextResponse(
      "Webhook verification failed.",
      {
        status: 500,
      }
    );
  }
}

/**
 * =========================================================
 * EXTRACT MESSAGE TEXT
 * =========================================================
 */
function extractMessageText(
  message: MetaMessage
): string {
  if (
    message.type === "text" &&
    message.text?.body
  ) {
    return message.text.body.trim();
  }

  if (
    message.type === "button" &&
    message.button?.text
  ) {
    return message.button.text.trim();
  }

  if (
    message.type ===
      "interactive" &&
    message.interactive
  ) {
    if (
      message.interactive.button_reply
        ?.title
    ) {
      return message.interactive.button_reply.title.trim();
    }

    if (
      message.interactive.list_reply
        ?.title
    ) {
      return message.interactive.list_reply.title.trim();
    }
  }

  if (
    message.type === "image"
  ) {
    return (
      message.image?.caption?.trim() ||
      "[Image received]"
    );
  }

  if (
    message.type === "video"
  ) {
    return (
      message.video?.caption?.trim() ||
      "[Video received]"
    );
  }

  if (
    message.type === "document"
  ) {
    return (
      message.document?.caption?.trim() ||
      `[Document received${
        message.document?.filename
          ? `: ${message.document.filename}`
          : ""
      }]`
    );
  }

  return `[${message.type || "Unknown"} message received]`;
}

/**
 * =========================================================
 * FIND PATIENT BY WHATSAPP NUMBER
 * =========================================================
 *
 * Tenant isolation is always applied.
 *
 * If the WhatsApp account belongs to a branch,
 * branch matching is attempted first.
 */
async function findPatientByWhatsAppPhone({
  clinicId,
  branchId,
  phone,
}: {
  clinicId: string;
  branchId: string | null;
  phone: string;
}) {
  const variants =
    buildWhatsAppPhoneVariants(
      phone
    );

  if (variants.length === 0) {
    return null;
  }

  /**
   * -------------------------------------------------------
   * Branch-specific lookup
   * -------------------------------------------------------
   */
  if (branchId) {
    const branchPatient =
      await prisma.patient.findFirst({
        where: {
          clinicId,
          branchId,
          phone: {
            in: variants,
          },
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          branchId: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    if (branchPatient) {
      return branchPatient;
    }
  }

  /**
   * -------------------------------------------------------
   * Clinic-wide lookup
   * -------------------------------------------------------
   */
  const patient =
    await prisma.patient.findFirst({
      where: {
        clinicId,
        phone: {
          in: variants,
        },
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        branchId: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

  if (patient) {
    return patient;
  }

  /**
   * -------------------------------------------------------
   * Fallback
   *
   * Some existing patient phone numbers may contain:
   *
   * +234 801 234 5678
   * 0801-234-5678
   *
   * For these cases, compare normalized numbers
   * against a limited candidate set.
   * -------------------------------------------------------
   */
  const candidates =
    await prisma.patient.findMany({
      where: {
        clinicId,
        ...(branchId
          ? {
              branchId,
            }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        branchId: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 500,
    });

  const normalizedIncoming =
    normalizeWhatsAppPhone(
      phone
    );

  const matched =
    candidates.find(
      (candidate) =>
        normalizeWhatsAppPhone(
          candidate.phone
        ) === normalizedIncoming
    );

  if (!matched) {
    return null;
  }

  return {
    id: matched.id,
    fullName: matched.fullName,
    phone: matched.phone,
    branchId: matched.branchId,
  };
}

/**
 * =========================================================
 * PROCESS MESSAGE
 * =========================================================
 */
async function processIncomingMessage({
  account,
  value,
  message,
}: {
  account: {
    id: string;
    clinicId: string;
    branchId: string | null;
    phoneNumberId: string | null;
  };
  value: MetaWebhookValue;
  message: MetaMessage;
}) {
  const messageId =
    message.id?.trim();

  const from =
    message.from?.trim();

  if (!messageId || !from) {
    return;
  }

  /**
   * -------------------------------------------------------
   * Duplicate protection
   * -------------------------------------------------------
   */
  const existing =
    await prisma.whatsAppMessage.findFirst(
      {
        where: {
          clinicId:
            account.clinicId,
          whatsappAccountId:
            account.id,
          messageId,
        },
        select: {
          id: true,
        },
      }
    );

  if (existing) {
    return;
  }

  const contact =
    value.contacts?.find(
      (item) =>
        item.wa_id === from
    );

  const contactName =
    contact?.profile?.name?.trim() ||
    null;

  const text =
    extractMessageText(message);

  /**
   * -------------------------------------------------------
   * Patient matching
   * -------------------------------------------------------
   */
  const patient =
    await findPatientByWhatsAppPhone({
      clinicId:
        account.clinicId,
      branchId:
        account.branchId,
      phone: from,
    });

  /**
   * If the WhatsApp account is branch-specific,
   * preserve that branch.
   *
   * Otherwise use the matched patient's branch.
   */
  const branchId =
    account.branchId ??
    patient?.branchId ??
    null;

  const messageRecord =
    await prisma.whatsAppMessage.create(
      {
        data: {
          clinicId:
            account.clinicId,

          branchId,

          patientId:
            patient?.id ?? null,

          whatsappAccountId:
            account.id,

          patientName:
            patient?.fullName ??
            contactName,

          phone:
            from,

          direction:
            "incoming",

          text,

          status:
            "received",

          messageId,

          intent:
            null,
        },

        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },

          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }
    );

  /**
   * -------------------------------------------------------
   * Execution log
   * -------------------------------------------------------
   */
  await prisma.executionLog.create({
    data: {
      clinicId:
        account.clinicId,

      workflowName:
        "WhatsApp Webhook",

      patientName:
        patient?.fullName ??
        contactName ??
        undefined,

      action:
        "RECEIVE_MESSAGE",

      status:
        "SUCCESS",

      message:
        patient
          ? `Incoming WhatsApp message received from ${patient.fullName}.`
          : `Incoming WhatsApp message received from ${from}. Patient was not matched.`,
    },
  });

  return messageRecord;
}

/**
 * =========================================================
 * PROCESS DELIVERY STATUS
 * =========================================================
 */
async function processMessageStatus({
  account,
  status,
}: {
  account: {
    id: string;
    clinicId: string;
  };
  status: MetaStatus;
}) {
  const messageId =
    status.id?.trim();

  const messageStatus =
    status.status?.trim();

  if (
    !messageId ||
    !messageStatus
  ) {
    return;
  }

  const updateResult =
    await prisma.whatsAppMessage.updateMany(
      {
        where: {
          clinicId:
            account.clinicId,

          whatsappAccountId:
            account.id,

          messageId,
        },

        data: {
          status:
            messageStatus,
        },
      }
    );

  if (updateResult.count > 0) {
    await prisma.executionLog.create({
      data: {
        clinicId:
          account.clinicId,

        workflowName:
          "WhatsApp Webhook",

        action:
          "MESSAGE_STATUS_UPDATE",

        status:
          "SUCCESS",

        message:
          `WhatsApp message ${messageId} status changed to ${messageStatus}.`,
      },
    });
  }
}

/**
 * =========================================================
 * POST
 * =========================================================
 *
 * Meta sends incoming messages and message statuses here.
 */
export async function POST(
  request: Request
) {
  try {
    /**
     * -------------------------------------------------------
     * Read raw body first.
     *
     * This is required because Meta's signature must be
     * calculated against the original raw request body.
     * -------------------------------------------------------
     */
    const rawBody =
      await request.text();

    /**
     * -------------------------------------------------------
     * Verify Meta signature
     * -------------------------------------------------------
     */
    const signature =
      request.headers.get(
        "x-hub-signature-256"
      );

    const signatureValid =
      verifyMetaWebhookSignature(
        rawBody,
        signature
      );

    if (!signatureValid) {
      console.warn(
        "Rejected WhatsApp webhook with invalid signature."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid webhook signature.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * -------------------------------------------------------
     * Parse payload
     * -------------------------------------------------------
     */
    let payload:
      | MetaWebhookPayload;

    try {
      payload =
        JSON.parse(
          rawBody
        ) as MetaWebhookPayload;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid webhook JSON.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * -------------------------------------------------------
     * Validate Meta object
     * -------------------------------------------------------
     */
    if (
      payload.object !==
      "whatsapp_business_account"
    ) {
      /**
       * Returning 200 prevents unnecessary retries for
       * webhook events that are not WhatsApp events.
       */
      return NextResponse.json({
        success: true,
      });
    }

    /**
     * -------------------------------------------------------
     * Process entries sequentially.
     *
     * This is deliberate to avoid creating a large number
     * of simultaneous Railway database connections.
     * -------------------------------------------------------
     */
    for (const entry of
      payload.entry ?? []) {
      for (const change of
        entry.changes ?? []) {
        if (
          change.field !==
          "messages"
        ) {
          continue;
        }

        const value =
          change.value;

        if (!value) {
          continue;
        }

        const phoneNumberId =
          value.metadata?.phone_number_id?.trim();

        if (!phoneNumberId) {
          console.warn(
            "WhatsApp webhook did not include phone_number_id."
          );

          continue;
        }

        /**
         * ---------------------------------------------------
         * Identify the VisionFlow WhatsApp account.
         *
         * phoneNumberId is globally unique in Meta.
         * ---------------------------------------------------
         */
        const account =
          await prisma.whatsAppAccount.findUnique(
            {
              where: {
                phoneNumberId,
              },

              select: {
                id: true,
                clinicId: true,
                branchId: true,
                phoneNumberId: true,
                status: true,
              },
            }
          );

        /**
         * Unknown WhatsApp account.
         *
         * This can happen when a Meta account is not yet
         * connected to VisionFlow.
         */
        if (!account) {
          console.warn(
            `WhatsApp webhook received for unregistered phone number ID: ${phoneNumberId}`
          );

          continue;
        }

        /**
         * ---------------------------------------------------
         * Update account activity
         * ---------------------------------------------------
         */
        await prisma.whatsAppAccount.update({
          where: {
            id: account.id,
          },

          data: {
            status:
              "connected",

            lastWebhookAt:
              new Date(),

            lastConnectedAt:
              new Date(),
          },
        });

        /**
         * ---------------------------------------------------
         * Process incoming messages
         * ---------------------------------------------------
         */
        for (const message of
          value.messages ?? []) {
          try {
            await processIncomingMessage(
              {
                account,
                value,
                message,
              }
            );
          } catch (error) {
            console.error(
              "Failed to process incoming WhatsApp message:",
              error
            );

            /**
             * Continue processing the remaining messages
             * instead of failing the entire webhook.
             */
          }
        }

        /**
         * ---------------------------------------------------
         * Process delivery/read/failed statuses
         * ---------------------------------------------------
         */
        for (const status of
          value.statuses ?? []) {
          try {
            await processMessageStatus(
              {
                account,
                status,
              }
            );
          } catch (error) {
            console.error(
              "Failed to process WhatsApp message status:",
              error
            );
          }
        }
      }
    }

    /**
     * -------------------------------------------------------
     * Meta expects a successful response.
     * -------------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/whatsapp/webhook error:",
      error
    );

    /**
     * Returning 500 allows Meta to retry the webhook when
     * an unexpected infrastructure/database failure occurs.
     */
    return NextResponse.json(
      {
        success: false,
        message:
          "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}