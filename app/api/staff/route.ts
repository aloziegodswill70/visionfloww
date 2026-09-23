import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = [
  "DOCTOR",
  "RECEPTIONIST",
  "OPTICIAN",
  "ACCOUNTANT",
  "MANAGER",
] as const;

function isStaffRole(
  role: unknown
): role is (typeof STAFF_ROLES)[number] {
  return (
    typeof role === "string" &&
    STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])
  );
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.clinicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const clinicId = session.user.clinicId;

    const staff = await prisma.user.findMany({
      where: {
        clinicId,
        role: {
          in: [...STAFF_ROLES],
        },
      },
      select: {
        id: true,
        clinicId: true,
        branchId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
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
      staff,
    });
  } catch (error) {
    console.error("GET /api/staff ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch staff.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.clinicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (session.user.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Only the clinic administrator can create staff.",
        },
        { status: 403 }
      );
    }

    const clinicId = session.user.clinicId;

    let body: {
      fullName?: unknown;
      email?: unknown;
      password?: unknown;
      role?: unknown;
      branchId?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const role = body.role;

    const branchId =
      typeof body.branchId === "string" && body.branchId.trim()
        ? body.branchId.trim()
        : null;

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (fullName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name must not exceed 150 characters.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address is required.",
        },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "Password is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must not exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    if (!isStaffRole(role)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid staff role. Select Doctor, Receptionist, Optician, Accountant, or Manager.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "A user with this email address already exists.",
        },
        { status: 409 }
      );
    }

    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: {
          id: branchId,
          clinicId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!branch) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected branch was not found.",
          },
          { status: 404 }
        );
      }

      if (!branch.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: "Staff cannot be assigned to an inactive branch.",
          },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        clinicId,
        branchId,
        fullName,
        email,
        password: hashedPassword,
        role,
        status: "active",
      },
      select: {
        id: true,
        clinicId: true,
        branchId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
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

    return NextResponse.json(
      {
        success: true,
        message: "Staff account created successfully.",
        staff: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staff ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A user with this email address already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create staff account.",
      },
      { status: 500 }
    );
  }
}