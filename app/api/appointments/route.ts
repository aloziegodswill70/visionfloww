import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppointmentStatus, UserRole } from "@prisma/client";

/**
 * ==========================================
 * ALLOWED ROLES
 * ==========================================
 *
 * These are the clinic roles that can work
 * with appointments.
 */
const APPOINTMENT_ROLES: UserRole[] = [
  "CLINIC_ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
  "MANAGER",
];

/**
 * ==========================================
 * GET ALL APPOINTMENTS
 * ==========================================
 */
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);

    const requestedBranchId = searchParams.get("branchId");
    const statusParam = searchParams.get("status");

    /**
     * ==========================================
     * VALIDATE STATUS FILTER
     * ==========================================
     */
    let status: AppointmentStatus | undefined;

    if (statusParam) {
      if (
        !Object.values(AppointmentStatus).includes(
          statusParam as AppointmentStatus
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid appointment status.",
          },
          {
            status: 400,
          }
        );
      }

      status = statusParam as AppointmentStatus;
    }

    /**
     * ==========================================
     * BUILD TENANT-SAFE WHERE CLAUSE
     * ==========================================
     *
     * Clinic admins can view all branches.
     *
     * Other branch-assigned users can only view
     * appointments belonging to their branch.
     */
    const where: {
      clinicId: string;
      branchId?: string;
      status?: AppointmentStatus;
    } = {
      clinicId,
    };

    if (role === "CLINIC_ADMIN") {
      if (requestedBranchId) {
        where.branchId = requestedBranchId;
      }
    } else if (userBranchId) {
      /**
       * Branch users are ALWAYS restricted to
       * their own branch.
       */
      if (
        requestedBranchId &&
        requestedBranchId !== userBranchId
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "You do not have access to this branch.",
          },
          {
            status: 403,
          }
        );
      }

      where.branchId = userBranchId;
    }

    if (status) {
      where.status = status;
    }

    /**
     * ==========================================
     * FETCH APPOINTMENTS
     * ==========================================
     */
    const appointments = await prisma.appointment.findMany({
      where,

      include: {
        patient: true,
        branch: true,
      },

      orderBy: [
        {
          date: "asc",
        },
        {
          time: "asc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("GET /api/appointments error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch appointments.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ==========================================
 * CREATE APPOINTMENT
 * ==========================================
 */
export async function POST(req: NextRequest) {
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
          error: "You do not have permission to create appointments.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await req.json();

    const patientName =
      typeof body.patientName === "string"
        ? body.patientName.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    const date =
      typeof body.date === "string"
        ? body.date.trim()
        : "";

    const time =
      typeof body.time === "string"
        ? body.time.trim()
        : "";

    const branchId =
      typeof body.branchId === "string"
        ? body.branchId.trim()
        : "";

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim() || null
        : null;

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
      !branchId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All required fields must be provided.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ==========================================
     * BRANCH ACCESS CHECK
     * ==========================================
     *
     * Clinic admins can create appointments for
     * any active branch in their clinic.
     *
     * Branch-assigned users can only create
     * appointments for their own branch.
     */
    if (
      role !== "CLINIC_ADMIN" &&
      userBranchId &&
      branchId !== userBranchId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have access to this branch.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * A non-admin user without a branch should
     * not be allowed to create an appointment
     * against an arbitrary branch.
     */
    if (role !== "CLINIC_ADMIN" && !userBranchId) {
      return NextResponse.json(
        {
          success: false,
          error: "Your account is not assigned to a branch.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * ==========================================
     * VERIFY BRANCH BELONGS TO THIS CLINIC
     * ==========================================
     */
    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
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
          status: 404,
        }
      );
    }

    /**
     * ==========================================
     * FIND EXISTING PATIENT
     * ==========================================
     *
     * Patient matching remains clinic-wide by
     * phone number, preserving the existing
     * behavior.
     */
    const patient = await prisma.patient.findFirst({
      where: {
        clinicId,
        phone,
      },
    });

    /**
     * ==========================================
     * CREATE APPOINTMENT
     * ==========================================
     */
    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        branchId,
        patientId: patient?.id ?? null,
        patientName,
        phone,
        reason,
        date,
        time,
        notes,
        status: AppointmentStatus.PENDING_RECEPTION_CONFIRMATION,
      },

      include: {
        patient: true,
        branch: true,
      },
    });

    /**
     * ==========================================
     * TODO:
     * Trigger WhatsApp appointment workflow
     * ==========================================
     */

    return NextResponse.json(
      {
        success: true,
        message: "Appointment created successfully.",
        appointment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/appointments error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create appointment.",
      },
      {
        status: 500,
      }
    );
  }
}

