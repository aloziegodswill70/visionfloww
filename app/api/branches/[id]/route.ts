import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * =========================================================
 * PUT
 *
 * Update branch details OR activate/deactivate a branch.
 *
 * Only CLINIC_ADMIN can modify branches.
 *
 * Tenant isolation:
 * The branch must belong to the authenticated user's clinic.
 * =========================================================
 */
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
        {
          status: 401,
        }
      );
    }

    if (session.user.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Only the clinic administrator can modify branches.",
        },
        {
          status: 403,
        }
      );
    }

    const clinicId = session.user.clinicId;
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * =====================================================
     * FIND BRANCH WITH TENANT ISOLATION
     * =====================================================
     */
    const existing = await prisma.branch.findFirst({
      where: {
        id,
        clinicId,
      },
      select: {
        id: true,
        clinicId: true,
        name: true,
        address: true,
        phone: true,
        isMain: true,
        isActive: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch not found.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * =====================================================
     * PARSE REQUEST BODY
     * =====================================================
     */
    let body: {
      name?: unknown;
      address?: unknown;
      phone?: unknown;
      isActive?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * =====================================================
     * ACTIVATE / DEACTIVATE
     * =====================================================
     *
     * The frontend can send:
     *
     * {
     *   isActive: true
     * }
     *
     * or:
     *
     * {
     *   isActive: false
     * }
     *
     * The main branch cannot be deactivated.
     */
    if (typeof body.isActive === "boolean") {
      if (existing.isMain && body.isActive === false) {
        return NextResponse.json(
          {
            success: false,
            error: "The main branch cannot be deactivated.",
          },
          {
            status: 400,
          }
        );
      }

      const updatedBranch = await prisma.branch.update({
        where: {
          id: existing.id,
        },
        data: {
          isActive: body.isActive,
        },
      });

      return NextResponse.json({
        success: true,
        message: body.isActive
          ? "Branch activated successfully."
          : "Branch deactivated successfully.",
        branch: updatedBranch,
      });
    }

    /**
     * =====================================================
     * UPDATE BRANCH INFORMATION
     * =====================================================
     */
    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const address =
      typeof body.address === "string" &&
      body.address.trim()
        ? body.address.trim()
        : null;

    const phone =
      typeof body.phone === "string" &&
      body.phone.trim()
        ? body.phone.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch name must not exceed 100 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (address && address.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch address must not exceed 500 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (phone && phone.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch phone number must not exceed 50 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * =====================================================
     * PREVENT DUPLICATE BRANCH NAMES
     *
     * Exclude the current branch from the duplicate check.
     * =====================================================
     */
    const duplicateBranch = await prisma.branch.findFirst({
      where: {
        clinicId,
        name: {
          equals: name,
          mode: "insensitive",
        },
        NOT: {
          id: existing.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateBranch) {
      return NextResponse.json(
        {
          success: false,
          error: "A branch with this name already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * =====================================================
     * UPDATE
     * =====================================================
     */
    const branch = await prisma.branch.update({
      where: {
        id: existing.id,
      },
      data: {
        name,
        address,
        phone,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Branch updated successfully.",
      branch,
    });
  } catch (error) {
    console.error("PUT /api/branches/[id] ERROR:", error);

    /**
     * Prisma unique constraint.
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A branch with this name already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update branch.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * =========================================================
 * DELETE
 *
 * Delete a branch.
 *
 * Only CLINIC_ADMIN can delete branches.
 *
 * The main branch can NEVER be deleted.
 *
 * A branch with dependent records cannot be deleted.
 * =========================================================
 */
export async function DELETE(
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
        {
          status: 401,
        }
      );
    }

    if (session.user.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Only the clinic administrator can delete branches.",
        },
        {
          status: 403,
        }
      );
    }

    const clinicId = session.user.clinicId;
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * =====================================================
     * FIND BRANCH WITH TENANT ISOLATION
     * =====================================================
     */
    const existing = await prisma.branch.findFirst({
      where: {
        id,
        clinicId,
      },
      select: {
        id: true,
        name: true,
        isMain: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Branch not found.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * =====================================================
     * MAIN BRANCH PROTECTION
     * =====================================================
     */
    if (existing.isMain) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The main branch cannot be deleted. It is the primary branch for this clinic.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * =====================================================
     * CHECK DEPENDENT RECORDS
     *
     * We do not delete a branch that still contains
     * clinic data.
     * =====================================================
     */
    const [
      userCount,
      patientCount,
      appointmentCount,
      whatsappAccountCount,
      whatsappMessageCount,
      opticalOrderCount,
      medicationReminderCount,
      followUpReminderCount,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          branchId: id,
        },
      }),

      prisma.patient.count({
        where: {
          branchId: id,
        },
      }),

      prisma.appointment.count({
        where: {
          branchId: id,
        },
      }),

      prisma.whatsAppAccount.count({
        where: {
          branchId: id,
        },
      }),

      prisma.whatsAppMessage.count({
        where: {
          branchId: id,
        },
      }),

      prisma.opticalOrder.count({
        where: {
          branchId: id,
        },
      }),

      prisma.medicationReminder.count({
        where: {
          branchId: id,
        },
      }),

      prisma.followUpReminder.count({
        where: {
          branchId: id,
        },
      }),
    ]);

    const dependencyCount =
      userCount +
      patientCount +
      appointmentCount +
      whatsappAccountCount +
      whatsappMessageCount +
      opticalOrderCount +
      medicationReminderCount +
      followUpReminderCount;

    if (dependencyCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This branch cannot be deleted because it contains associated clinic records. Deactivate the branch instead.",
          dependencies: {
            users: userCount,
            patients: patientCount,
            appointments: appointmentCount,
            whatsappAccounts: whatsappAccountCount,
            whatsappMessages: whatsappMessageCount,
            opticalOrders: opticalOrderCount,
            medicationReminders: medicationReminderCount,
            followUpReminders: followUpReminderCount,
          },
        },
        {
          status: 409,
        }
      );
    }

    /**
     * =====================================================
     * DELETE
     * =====================================================
     */
    await prisma.branch.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Branch deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/branches/[id] ERROR:", error);

    /**
     * Prisma foreign-key constraint.
     *
     * This protects us even if another dependent record
     * was created between our dependency check and delete.
     */
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
            "This branch cannot be deleted because it has associated clinic records. Deactivate the branch instead.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete branch.",
      },
      {
        status: 500,
      }
    );
  }
}