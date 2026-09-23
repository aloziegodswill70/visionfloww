import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * =========================================================
 * GET
 * Fetch all branches belonging to the authenticated clinic.
 *
 * Tenant isolation:
 * The clinicId always comes from the authenticated session.
 * It is NEVER accepted from the client.
 * =========================================================
 */
export async function GET(_req: NextRequest) {
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

    const branches = await prisma.branch.findMany({
      where: {
        clinicId,
      },

      orderBy: [
        {
          isMain: "desc",
        },
        {
          createdAt: "asc",
        },
      ],

      include: {
        _count: {
          select: {
            patients: true,
            appointments: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      branches,
    });
  } catch (error) {
    console.error("GET /api/branches ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch branches.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * =========================================================
 * POST
 * Create a new branch for the authenticated clinic.
 *
 * Only CLINIC_ADMIN can create branches.
 *
 * Tenant isolation:
 * clinicId comes exclusively from the authenticated session.
 * =========================================================
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

    if (session.user.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Only the clinic administrator can create branches.",
        },
        {
          status: 403,
        }
      );
    }

    const clinicId = session.user.clinicId;

    let body: {
      name?: unknown;
      address?: unknown;
      phone?: unknown;
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

    /**
     * =====================================================
     * VALIDATION
     * =====================================================
     */
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
     * =====================================================
     */
    const existingBranch = await prisma.branch.findFirst({
      where: {
        clinicId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    if (existingBranch) {
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
     * CREATE BRANCH
     * =====================================================
     */
    const branch = await prisma.branch.create({
      data: {
        clinicId,
        name,
        address,
        phone,
        isMain: false,
        isActive: true,
      },

      include: {
        _count: {
          select: {
            patients: true,
            appointments: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Branch created successfully.",
        branch,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/branches ERROR:", error);

    /**
     * Prisma unique constraint protection.
     *
     * The schema has:
     * @@unique([clinicId, name])
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
        error: "Failed to create branch.",
      },
      {
        status: 500,
      }
    );
  }
}