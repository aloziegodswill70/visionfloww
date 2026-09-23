import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  AppointmentStatus,
  UserRole,
} from "@prisma/client";

/**
 * ==========================================
 * APPOINTMENT STATUS WORKFLOW
 * ==========================================
 *
 * PENDING_RECEPTION_CONFIRMATION
 *              ↓
 * RECEPTION_CONFIRMED
 *              ↓
 * PATIENT_CONFIRMED
 *              ↓
 * CHECKED_IN
 *              ↓
 * IN_CONSULTATION
 *              ↓
 * COMPLETED
 *
 * Alternative states:
 *
 * CANCELLED
 * MISSED
 * RESCHEDULED
 *
 * Status changes must always pass through
 * this endpoint.
 */

/**
 * ==========================================
 * ALLOWED STATUS TRANSITIONS
 * ==========================================
 */
const allowedTransitions: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  PENDING_RECEPTION_CONFIRMATION: [
    "RECEPTION_CONFIRMED",
    "CANCELLED",
    "RESCHEDULED",
  ],

  RECEPTION_CONFIRMED: [
    "PATIENT_CONFIRMED",
    "CANCELLED",
    "RESCHEDULED",
  ],

  PATIENT_CONFIRMED: [
    "CHECKED_IN",
    "MISSED",
    "CANCELLED",
    "RESCHEDULED",
  ],

  CHECKED_IN: [
    "IN_CONSULTATION",
    "CANCELLED",
  ],

  IN_CONSULTATION: [
    "COMPLETED",
  ],

  COMPLETED: [],

  CANCELLED: [],

  MISSED: [
    "RESCHEDULED",
  ],

  RESCHEDULED: [
    "RECEPTION_CONFIRMED",
    "CANCELLED",
  ],
};

/**
 * ==========================================
 * STATUS UPDATE ROLES
 * ==========================================
 *
 * These are the roles allowed to change
 * appointment workflow status.
 */
const STATUS_UPDATE_ROLES: UserRole[] = [
  "CLINIC_ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
  "MANAGER",
];

/**
 * ==========================================
 * PATCH APPOINTMENT STATUS
 * ==========================================
 */
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /**
     * ==========================================
     * AUTHENTICATION
     * ==========================================
     */
    const session = await getServerSession(authOptions);

    if (!session?.user?.clinicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const clinicId = session.user.clinicId;
    const role = session.user.role as UserRole;
    const userBranchId = session.user.branchId ?? null;

    /**
     * ==========================================
     * ROLE AUTHORIZATION
     * ==========================================
     */
    if (!STATUS_UPDATE_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to update appointment status.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    /**
     * ==========================================
     * READ REQUEST BODY
     * ==========================================
     */
    const body = await req.json();

    const requestedStatus =
      typeof body.status === "string"
        ? body.status.trim()
        : "";

    if (!requestedStatus) {
      return NextResponse.json(
        {
          success: false,
          error: "Status is required.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ==========================================
     * VALIDATE STATUS AGAINST PRISMA ENUM
     * ==========================================
     */
    if (
      !Object.values(AppointmentStatus).includes(
        requestedStatus as AppointmentStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid appointment status.",
          allowedStatuses: Object.values(AppointmentStatus),
        },
        {
          status: 400,
        }
      );
    }

    const status =
      requestedStatus as AppointmentStatus;

    /**
     * ==========================================
     * FIND APPOINTMENT
     * ==========================================
     *
     * Tenant isolation is enforced here.
     *
     * Branch users are additionally restricted
     * to appointments belonging to their branch.
     */
    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          clinicId,

          ...(role !== "CLINIC_ADMIN" && userBranchId
            ? {
                branchId: userBranchId,
              }
            : {}),
        },

        include: {
          branch: true,
          patient: true,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment not found.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * ==========================================
     * CURRENT STATUS
     * ==========================================
     */
    const currentStatus = appointment.status;

    /**
     * ==========================================
     * CHECK STATUS TRANSITION
     * ==========================================
     */
    const nextStatuses =
      allowedTransitions[currentStatus] ?? [];

    if (!nextStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot change appointment from ${currentStatus} to ${status}.`,
          currentStatus,
          allowedNextStatuses: nextStatuses,
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ==========================================
     * UPDATE STATUS
     * ==========================================
     */
    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id: appointment.id,
        },

        data: {
          status,
        },

        include: {
          patient: true,
          branch: true,
        },
      });

    /**
     * ==========================================
     * EXECUTION LOG
     * ==========================================
     *
     * Keep the workflow history so we can later
     * use this for automation monitoring and
     * WhatsApp workflow debugging.
     */
    await prisma.executionLog.create({
      data: {
        clinicId,

        workflowName: "Appointment Workflow",

        patientName:
          appointment.patientName,

        action: `${currentStatus} → ${status}`,

        status: "SUCCESS",

        message:
          `Appointment moved from ${currentStatus} to ${status}.`,
      },
    });

    /**
     * ==========================================
     * FUTURE AUTOMATION HOOKS
     * ==========================================
     *
     * WhatsApp Cloud API automation will be
     * connected here later.
     */
    switch (status) {
      case "RECEPTION_CONFIRMED":
        // Future:
        // Notify patient that reception has
        // confirmed the appointment.
        break;

      case "PATIENT_CONFIRMED":
        // Future:
        // Schedule WhatsApp appointment reminders.
        break;

      case "CHECKED_IN":
        // Future:
        // Notify doctor/dashboard.
        break;

      case "IN_CONSULTATION":
        // Future:
        // Mark patient as currently consulting.
        break;

      case "COMPLETED":
        // Future:
        // Trigger follow-up workflow.
        break;

      case "MISSED":
        // Future:
        // Trigger missed appointment workflow.
        break;

      case "RESCHEDULED":
        // Future:
        // Send new appointment details.
        break;

      case "CANCELLED":
        // Future:
        // Notify patient of cancellation.
        break;

      default:
        break;
    }

    /**
     * ==========================================
     * RESPONSE
     * ==========================================
     */
    return NextResponse.json({
      success: true,

      message:
        "Appointment status updated successfully.",

      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error(
      "PATCH /api/appointments/[id]/status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update appointment status.",
      },
      {
        status: 500,
      }
    );
  }
}

