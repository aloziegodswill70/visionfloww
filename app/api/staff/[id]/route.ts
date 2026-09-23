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

async function getClinicAdmin(clinicId: string | null | undefined) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.clinicId) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "CLINIC_ADMIN") {
    return {
      error: NextResponse.json(
        {
          success: false,
          error:
            "Only the clinic administrator can modify staff accounts.",
        },
        { status: 403 }
      ),
    };
  }

  if (!clinicId || session.user.clinicId !== clinicId) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Clinic access denied.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    session,
    clinicId,
  };
}

export async function PUT(
  req: Request,
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
        { status: 401 }
      );
    }

    if (session.user.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only the clinic administrator can modify staff accounts.",
        },
        { status: 403 }
      );
    }

    const clinicId = session.user.clinicId;
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff ID is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        id,
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
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff member not found.",
        },
        { status: 404 }
      );
    }

    let body: {
      fullName?: unknown;
      email?: unknown;
      password?: unknown;
      role?: unknown;
      branchId?: unknown;
      status?: unknown;
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

    /*
     * STATUS UPDATE
     */
    if (
      typeof body.status === "string" &&
      (body.status === "active" || body.status === "inactive") &&
      Object.keys(body).length === 1
    ) {
      const updated = await prisma.user.update({
        where: {
          id: existing.id,
        },
        data: {
          status: body.status,
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

      return NextResponse.json({
        success: true,
        message:
          body.status === "active"
            ? "Staff account activated successfully."
            : "Staff account deactivated successfully.",
        staff: updated,
      });
    }

    /*
     * FULL UPDATE
     */

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : existing.fullName;

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : existing.email;

    const role =
      body.role !== undefined
        ? body.role
        : existing.role;

    const branchId =
      body.branchId === null ||
      body.branchId === ""
        ? null
        : typeof body.branchId === "string"
          ? body.branchId.trim()
          : existing.branchId;

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

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

    if (!isStaffRole(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid staff role.",
        },
        { status: 400 }
      );
    }

    if (password && password.length < 8) {
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

    if (email !== existing.email) {
      const emailOwner = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

      if (emailOwner && emailOwner.id !== existing.id) {
        return NextResponse.json(
          {
            success: false,
            error: "A user with this email address already exists.",
          },
          { status: 409 }
        );
      }
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

    const data: {
      fullName: string;
      email: string;
      role: (typeof STAFF_ROLES)[number];
      branchId: string | null;
      password?: string;
    } = {
      fullName,
      email,
      role,
      branchId,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.user.update({
      where: {
        id: existing.id,
      },
      data,
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

    return NextResponse.json({
      success: true,
      message: "Staff account updated successfully.",
      staff: updated,
    });
  } catch (error) {
    console.error("PUT /api/staff/[id] ERROR:", error);

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
        error: "Failed to update staff account.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
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
        { status: 401 }
      );
    }

    if (session.user.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only the clinic administrator can delete staff accounts.",
        },
        { status: 403 }
      );
    }

    const clinicId = session.user.clinicId;
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff ID is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        id,
        clinicId,
        role: {
          in: [...STAFF_ROLES],
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff member not found.",
        },
        { status: 404 }
      );
    }

    const auditCount = await prisma.auditLog.count({
      where: {
        userId: id,
      },
    });

    /*
     * Audit logs use SetNull on user deletion, so deletion is technically
     * safe. We intentionally allow deletion here.
     */
    void auditCount;

    await prisma.user.delete({
      where: {
        id: existing.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${existing.fullName} has been deleted successfully.`,
    });
  } catch (error) {
    console.error("DELETE /api/staff/[id] ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This staff account cannot be deleted because it has associated records. Deactivate the account instead.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete staff account.",
      },
      { status: 500 }
    );
  }
}