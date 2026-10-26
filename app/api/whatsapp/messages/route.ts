import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicUser } from "@/lib/auth-helpers";
import { getTenant } from "@/lib/tenant";
import {
  normalizeWhatsAppPhone,
  sendWhatsAppText,
} from "@/lib/whatsapp/meta";
import { decryptSecret } from "@/lib/whatsapp/security";

export const runtime = "nodejs";

/* =========================================================
   GET
   ---------------------------------------------------------
   WhatsApp inbox/conversation retrieval.
   ========================================================= */

export async function GET(request: Request) {
  try {
    await requireClinicUser();

    const tenant = await getTenant();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const clinicId = tenant.clinicId;
    const branchId = tenant.branchId;

    if (!clinicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Clinic context not found.",
        },
        { status: 403 }
      );
    }

    /* =====================================================
       SINGLE PATIENT CONVERSATION
       ===================================================== */

    if (patientId) {
      const patient = await prisma.patient.findFirst({
        where: {
          id: patientId,
          clinicId,
          ...(branchId ? { branchId } : {}),
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          branchId: true,
        },
      });

      if (!patient) {
        return NextResponse.json(
          {
            success: false,
            message: "Patient not found.",
          },
          { status: 404 }
        );
      }

      const messages = await prisma.whatsAppMessage.findMany({
        where: {
          clinicId,
          patientId: patient.id,
          ...(branchId ? { branchId } : {}),
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          patientId: true,
          patientName: true,
          phone: true,
          direction: true,
          text: true,
          status: true,
          intent: true,
          messageId: true,
          createdAt: true,
          branchId: true,
        },
      });

      return NextResponse.json({
        success: true,
        patient,
        messages,
      });
    }

    /* =====================================================
       ALL PATIENT CONVERSATIONS
       ===================================================== */

    const patients = await prisma.patient.findMany({
      where: {
        clinicId,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: {
        fullName: "asc",
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        branchId: true,
      },
    });

    const messages = await prisma.whatsAppMessage.findMany({
      where: {
        clinicId,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        patientId: true,
        patientName: true,
        phone: true,
        direction: true,
        text: true,
        status: true,
        intent: true,
        messageId: true,
        createdAt: true,
        branchId: true,
      },
    });

    /* =====================================================
       BUILD CONVERSATIONS
       -----------------------------------------------------
       Every registered patient is included, even if they
       have never sent/received a WhatsApp message yet.
       ===================================================== */

    const conversations = patients.map((patient) => {
      const patientMessages = messages.filter(
        (message) => message.patientId === patient.id
      );

      const latestMessage = patientMessages[0] ?? null;

      return {
        patientId: patient.id,
        patientName: patient.fullName,
        phone: patient.phone,
        branchId: patient.branchId,

        latestMessage: latestMessage?.text ?? "",

        latestMessageAt:
          latestMessage?.createdAt?.toISOString() ?? null,

        latestDirection:
          latestMessage?.direction ?? null,

        latestStatus:
          latestMessage?.status ?? null,

        hasMessages: patientMessages.length > 0,
      };
    });

    return NextResponse.json({
      success: true,
      conversations,
      patients,
      messages,
    });
  } catch (error) {
    console.error(
      "GET /api/whatsapp/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load WhatsApp messages.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST
   ---------------------------------------------------------
   Send a REAL WhatsApp message through Meta Cloud API.

   CURRENT VISIONFLOW RULE:
   ---------------------------------------------------------
   ONE CLINIC = ONE CONNECTED WHATSAPP ACCOUNT

   We deliberately do not select an account based on:
   - patient history
   - branch
   - latest message
   - createdAt

   The clinic must have exactly one connected account.
   ========================================================= */

export async function POST(request: Request) {
  try {
    await requireClinicUser();

    const tenant = await getTenant();

    const clinicId = tenant.clinicId;
    const branchId = tenant.branchId;

    if (!clinicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Clinic context not found.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const patientId =
      typeof body.patientId === "string"
        ? body.patientId.trim()
        : "";

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    /* =====================================================
       VALIDATE PATIENT ID
       ===================================================== */

    if (!patientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID is required.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VALIDATE MESSAGE TEXT
       ===================================================== */

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Message text is required.",
        },
        { status: 400 }
      );
    }

    if (text.length > 4096) {
      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp text messages cannot exceed 4096 characters.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       1. FIND PATIENT
       -----------------------------------------------------
       Tenant isolation is mandatory.

       A clinic user can only send messages to patients
       belonging to their own clinic.

       Branch isolation is also preserved for branch users.
       ===================================================== */

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId,
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true,
        clinicId: true,
        branchId: true,
        fullName: true,
        phone: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       2. DETERMINE MESSAGE BRANCH
       ===================================================== */

    const effectiveBranchId =
      patient.branchId ?? branchId ?? null;

    /* =====================================================
       3. FIND THE CLINIC'S CONNECTED WHATSAPP ACCOUNT
       -----------------------------------------------------
       CURRENT RULE:

       ONE CLINIC = ONE CONNECTED WHATSAPP ACCOUNT

       We intentionally do not select:
       - latest account
       - branch account
       - patient account
       - account from previous message

       This prevents an old connected Meta account from
       accidentally being used.
       ===================================================== */

    const connectedWhatsAppAccounts =
      await prisma.whatsAppAccount.findMany({
        where: {
          clinicId,
          status: "connected",
          accessTokenEncrypted: {
            not: null,
          },
          phoneNumberId: {
            not: null,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    /* =====================================================
       3A. NO CONNECTED ACCOUNT
       ===================================================== */

    if (connectedWhatsAppAccounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No connected WhatsApp account is available for this clinic. Connect a WhatsApp account before sending messages.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       3B. MORE THAN ONE CONNECTED ACCOUNT
       -----------------------------------------------------
       We deliberately refuse to guess.

       This is important because selecting an arbitrary
       account can cause Meta authentication errors or send
       a message from the wrong WhatsApp number.
       ===================================================== */

    if (connectedWhatsAppAccounts.length > 1) {
      console.error(
        "Multiple connected WhatsApp accounts detected for clinic:",
        {
          clinicId,
          accounts: connectedWhatsAppAccounts.map(
            (account) => ({
              id: account.id,
              phoneNumberId: account.phoneNumberId,
              branchId: account.branchId,
              status: account.status,
            })
          ),
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Multiple connected WhatsApp accounts were found for this clinic. Please disconnect the extra WhatsApp account before sending messages.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       3C. USE THE SINGLE CONNECTED ACCOUNT
       ===================================================== */

    const whatsappAccount =
      connectedWhatsAppAccounts[0];

    /* =====================================================
       SAFE DIAGNOSTIC LOG
       -----------------------------------------------------
       NEVER log:
       - accessToken
       - decrypted token
       - encrypted token
       ===================================================== */

    console.log(
      "WhatsApp outbound account selected:",
      {
        accountId: whatsappAccount.id,
        phoneNumberId:
          whatsappAccount.phoneNumberId,
        clinicId: whatsappAccount.clinicId,
        branchId: whatsappAccount.branchId,
      }
    );

    /* =====================================================
       4. CHECK PHONE NUMBER ID
       ===================================================== */

    if (!whatsappAccount.phoneNumberId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The connected WhatsApp account does not have a Phone Number ID.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       5. CHECK ENCRYPTED ACCESS TOKEN
       ===================================================== */

    if (!whatsappAccount.accessTokenEncrypted) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The connected WhatsApp account does not have a valid access token.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       6. NORMALIZE PATIENT WHATSAPP NUMBER
       ===================================================== */

    const normalizedPhone =
      normalizeWhatsAppPhone(patient.phone);

    if (!normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The patient's phone number is not a valid WhatsApp number.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       7. DECRYPT META ACCESS TOKEN
       ===================================================== */

    let accessToken: string;

    try {
      accessToken = decryptSecret(
        whatsappAccount.accessTokenEncrypted
      );
    } catch (error) {
      console.error(
        "WhatsApp token decryption failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to securely access the connected WhatsApp account.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       8. SEND THROUGH META CLOUD API
       ===================================================== */

    let metaResponse;

    try {
      metaResponse = await sendWhatsAppText({
        phoneNumberId:
          whatsappAccount.phoneNumberId,
        accessToken,
        to: normalizedPhone,
        text,
      });
    } catch (error) {
      console.error(
        "Meta WhatsApp message send failed:",
        error
      );

      /* =================================================
         SAVE FAILED EXECUTION LOG
         ================================================= */

      try {
        await prisma.executionLog.create({
          data: {
            clinicId,
            workflowName: "WhatsApp Message",
            patientName: patient.fullName,
            action: "SEND_WHATSAPP_MESSAGE",
            status: "failed",
            message:
              error instanceof Error
                ? error.message
                : "Meta WhatsApp API request failed.",
          },
        });
      } catch (logError) {
        console.error(
          "Failed to create WhatsApp execution log:",
          logError
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to send WhatsApp message.",
        },
        { status: 502 }
      );
    }

    /* =====================================================
       9. EXTRACT META MESSAGE ID
       ===================================================== */

    const metaMessageId =
      metaResponse?.messages?.[0]?.id ?? null;

    if (!metaMessageId) {
      console.error(
        "Meta WhatsApp API returned no message ID:",
        metaResponse
      );

      /* =================================================
         SAVE FAILED EXECUTION LOG
         ================================================= */

      try {
        await prisma.executionLog.create({
          data: {
            clinicId,
            workflowName: "WhatsApp Message",
            patientName: patient.fullName,
            action: "SEND_WHATSAPP_MESSAGE",
            status: "failed",
            message:
              "Meta accepted the request but did not return a WhatsApp message ID.",
          },
        });
      } catch (logError) {
        console.error(
          "Failed to create execution log:",
          logError
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "WhatsApp message could not be confirmed by Meta.",
        },
        { status: 502 }
      );
    }

    /* =====================================================
       10. SAVE OUTGOING MESSAGE
       ===================================================== */

    const savedMessage =
      await prisma.whatsAppMessage.create({
        data: {
          clinicId,
          branchId: effectiveBranchId,
          patientId: patient.id,
          whatsappAccountId: whatsappAccount.id,

          patientName: patient.fullName,
          phone: normalizedPhone,

          direction: "outgoing",
          text,
          status: "sent",

          messageId: metaMessageId,
        },
        select: {
          id: true,
          clinicId: true,
          branchId: true,
          patientId: true,
          whatsappAccountId: true,
          patientName: true,
          phone: true,
          direction: true,
          text: true,
          status: true,
          messageId: true,
          createdAt: true,
        },
      });

    /* =====================================================
       11. CREATE SUCCESS EXECUTION LOG
       ===================================================== */

    try {
      await prisma.executionLog.create({
        data: {
          clinicId,
          workflowName: "WhatsApp Message",
          patientName: patient.fullName,
          action: "SEND_WHATSAPP_MESSAGE",
          status: "success",
          message: `WhatsApp message sent successfully. Meta message ID: ${metaMessageId}`,
        },
      });
    } catch (logError) {
      console.error(
        "Failed to create WhatsApp execution log:",
        logError
      );
    }

    /* =====================================================
       12. RETURN SUCCESS
       ===================================================== */

    return NextResponse.json({
      success: true,
      message: "WhatsApp message sent successfully.",
      data: savedMessage,
      meta: {
        messageId: metaMessageId,
        phoneNumberId:
          whatsappAccount.phoneNumberId,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/whatsapp/messages error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send WhatsApp message.",
      },
      { status: 500 }
    );
  }
}

