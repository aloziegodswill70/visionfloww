import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClinicUser } from "@/lib/auth-helpers";

const WRITE_ROLES = [
  "CLINIC_ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
  "OPTICIAN",
  "MANAGER",
];

function canWrite(role: string) {
  return WRITE_ROLES.includes(role);
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

export async function GET(req: Request) {
  try {
    const user = await requireClinicUser();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const branchId = searchParams.get("branchId")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const where: any = {
      clinicId: user.clinicId,
    };

    /*
     * Branch isolation:
     * Clinic admins can see every branch.
     * Other branch-assigned users only see their own branch.
     *
     * Users without a branch assignment can see clinic-wide records
     * only if they are clinic-level roles.
     */
    if (user.role !== "CLINIC_ADMIN" && user.branchId) {
      where.branchId = user.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    if (status && ["Active", "Inactive"].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            whatsappMessages: true,
            opticalOrders: true,
            medicationReminders: true,
            followUpReminders: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to load patients.";

    const statusCode =
      message === "Unauthorized"
        ? 401
        : message === "Clinic not found"
          ? 403
          : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status: statusCode }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireClinicUser();

    if (!canWrite(user.role)) {
      return NextResponse.json(
        { error: "You do not have permission to create patients." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const fullName = body.fullName?.trim();
    const phone = normalizePhone(body.phone || "");
    const gender = body.gender?.trim() || null;
    const status = body.status?.trim() || "Active";
    const requestedBranchId = body.branchId?.trim() || "";

    if (!fullName) {
      return NextResponse.json(
        { error: "Patient full name is required." },
        { status: 400 }
      );
    }

    if (fullName.length > 150) {
      return NextResponse.json(
        { error: "Patient name is too long." },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Patient phone number is required." },
        { status: 400 }
      );
    }

    if (phone.length < 7 || phone.length > 30) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (!["Active", "Inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid patient status." },
        { status: 400 }
      );
    }

    let branchId: string | null = null;

    /*
     * Branch assignment rules.
     *
     * Clinic admin can choose any active branch.
     * Branch users are automatically restricted to their own branch.
     */
    if (user.role !== "CLINIC_ADMIN" && user.branchId) {
      branchId = user.branchId;
    } else if (requestedBranchId) {
      const branch = await prisma.branch.findFirst({
        where: {
          id: requestedBranchId,
          clinicId: user.clinicId,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (!branch) {
        return NextResponse.json(
          { error: "Selected branch was not found or is inactive." },
          { status: 400 }
        );
      }

      branchId = branch.id;
    }

    /*
     * Prevent accidental duplicate patient records
     * within the same clinic.
     *
     * We intentionally do not use phone as a unique database field
     * because family members may share a phone number.
     */
    const existingPatients = await prisma.patient.findMany({
      where: {
        clinicId: user.clinicId,
        phone,
      },
      select: {
        id: true,
        fullName: true,
      },
      take: 20,
    });

    const duplicateName = existingPatients.find(
      (patient) =>
        patient.fullName.trim().toLowerCase() === fullName.toLowerCase()
    );

    if (duplicateName) {
      return NextResponse.json(
        {
          error:
            "A patient with this name and phone number already exists in this clinic.",
        },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        clinicId: user.clinicId,
        branchId,
        fullName,
        phone,
        gender,
        status,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Patient created successfully.",
        patient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PATIENT ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create patient.";

    const statusCode =
      message === "Unauthorized"
        ? 401
        : message === "Clinic not found"
          ? 403
          : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status: statusCode }
    );
  }
}