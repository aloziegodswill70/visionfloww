import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * ==========================================
 * APPOINTMENT ROLES
 * ==========================================
 *
 * These roles can work with appointments.
 */
const APPOINTMENT_ROLES: UserRole[] = [
  "CLINIC_ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
  "MANAGER",
];

/**
 * ==========================================
 * WRITE ROLES
 * ==========================================
 *
 * Roles allowed to modify appointment data.
 */
const APPOINTMENT_WRITE_ROLES: UserRole[] = [
  "CLINIC_ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
  "MANAGER",
];

/**
 * ==========================================
 * GET SINGLE APPOINTMENT
 * ==========================================
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
     * ROLE CHECK
     * ==========================================
     */
    if (!APPOINTMENT_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to view appointments.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    /**
     * ==========================================
     * TENANT + BRANCH SCOPING
     * ==========================================
     */
    const appointment = await prisma.appointment.findFirst({
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
        patient: true,
        branch: true,
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

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("GET /api/appointments/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch appointment.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ==========================================
 * UPDATE APPOINTMENT
 * ==========================================
 *
 * This route updates appointment details only.
 *
 * Appointment STATUS changes are intentionally
 * handled by:
 *
 * /api/appointments/[id]/status
 *
 * This keeps the workflow controlled.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
     * ROLE CHECK
     * ==========================================
     */
    if (!APPOINTMENT_WRITE_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to update appointments.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    /**
     * ==========================================
     * FIND APPOINTMENT
     * ==========================================
     */
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        clinicId,

        ...(role !== "CLINIC_ADMIN" && userBranchId
          ? {
              branchId: userBranchId,
            }
          : {}),
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

    const body = await req.json();

    /**
     * ==========================================
     * NORMALIZE INPUT
     * ==========================================
     */
    const patientName =
      typeof body.patientName === "string"
        ? body.patientName.trim()
        : appointment.patientName;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : appointment.phone;

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : appointment.reason;

    const date =
      typeof body.date === "string"
        ? body.date.trim()
        : appointment.date;

    const time =
      typeof body.time === "string"
        ? body.time.trim()
        : appointment.time;

    const notes =
      body.notes === null
        ? null
        : typeof body.notes === "string"
        ? body.notes.trim() || null
        : appointment.notes;

    const requestedBranchId =
      typeof body.branchId === "string"
        ? body.branchId.trim()
        : appointment.branchId;

    /**
     * ==========================================
     * VALIDATE REQUIRED FIELDS
     * ==========================================
     */
    if (
      !patientName ||
      !phone ||
      !reason ||
      !date ||
      !time ||
      !requestedBranchId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Patient name, phone, reason, date, time and branch are required.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ==========================================
     * BRANCH ACCESS
     * ==========================================
     *
     * Clinic admin can move appointments between
     * branches.
     *
     * Branch-assigned staff cannot move an
     * appointment outside their own branch.
     */
    if (
      role !== "CLINIC_ADMIN" &&
      userBranchId &&
      requestedBranchId !== userBranchId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have access to the selected branch.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * ==========================================
     * VERIFY TARGET BRANCH
     * ==========================================
     */
    const branch = await prisma.branch.findFirst({
      where: {
        id: requestedBranchId,
        clinicId,
        isActive: true,
      },
    });

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or inactive branch selected.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ==========================================
     * FIND PATIENT
     * ==========================================
     *
     * If the phone changes, reconnect the
     * appointment to an existing patient in
     * this clinic.
     */
    let patientId = appointment.patientId;

    if (phone !== appointment.phone) {
      const patient = await prisma.patient.findFirst({
        where: {
          clinicId,
          phone,
        },
      });

      patientId = patient?.id ?? null;
    }

    /**
     * ==========================================
     * UPDATE APPOINTMENT
     * ==========================================
     *
     * Notice that STATUS is intentionally absent.
     *
     * Status changes must go through the dedicated
     * status endpoint.
     */
    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id: appointment.id,
        },

        data: {
          patientName,
          phone,
          reason,
          date,
          time,
          branchId: requestedBranchId,
          notes,
          patientId,
        },

        include: {
          patient: true,
          branch: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("PUT /api/appointments/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update appointment.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ==========================================
 * DELETE APPOINTMENT
 * ==========================================
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
     * DELETE PERMISSION
     * ==========================================
     *
     * Deleting appointments is intentionally
     * more restricted than viewing them.
     */
    if (role !== "CLINIC_ADMIN" && role !== "RECEPTIONIST") {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to delete appointments.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    /**
     * ==========================================
     * FIND APPOINTMENT
     * ==========================================
     */
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        clinicId,

        ...(role !== "CLINIC_ADMIN" && userBranchId
          ? {
              branchId: userBranchId,
            }
          : {}),
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
     * DELETE
     * ==========================================
     */
    await prisma.appointment.delete({
      where: {
        id: appointment.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Appointment deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/appointments/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete appointment.",
      },
      {
        status: 500,
      }
    );
  }
}

