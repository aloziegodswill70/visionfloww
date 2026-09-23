import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clinicName = body.clinicName?.trim();
    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!clinicName || !fullName || !email || !password) {
      return NextResponse.json(
        {
          error: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    =========================================================
    GENERATE CLINIC SLUG
    =========================================================
    */

    const baseSlug = clinicName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!baseSlug) {
      return NextResponse.json(
        {
          error: "Please provide a valid clinic name.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    =========================================================
    CHECK EXISTING USER
    =========================================================
    */

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    =========================================================
    CHECK EXISTING CLINIC
    =========================================================
    */

    const existingClinic = await prisma.clinic.findUnique({
      where: {
        slug: baseSlug,
      },
    });

    if (existingClinic) {
      return NextResponse.json(
        {
          error:
            "A clinic with this name already exists. Please choose another clinic name.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    =========================================================
    HASH PASSWORD
    =========================================================
    */

    const hashedPassword = await bcrypt.hash(password, 12);

    /*
    =========================================================
    ATOMIC REGISTRATION TRANSACTION
    =========================================================

    Everything below succeeds together or fails together:

    1. Clinic
    2. Main Branch
    3. Clinic Admin
    4. Clinic owner relationship
    =========================================================
    */

    const result = await prisma.$transaction(async (tx) => {
      /*
      -------------------------------------------------------
      1. CREATE CLINIC
      -------------------------------------------------------
      */

      const clinic = await tx.clinic.create({
        data: {
          name: clinicName,
          slug: baseSlug,
        },
      });

      /*
      -------------------------------------------------------
      2. CREATE MAIN BRANCH
      -------------------------------------------------------
      */

      const mainBranch = await tx.branch.create({
        data: {
          clinicId: clinic.id,
          name: "Main Branch",
          isMain: true,
          isActive: true,
        },
      });

      /*
      -------------------------------------------------------
      3. CREATE CLINIC ADMIN
      -------------------------------------------------------
      */

      const user = await tx.user.create({
        data: {
          clinicId: clinic.id,
          branchId: mainBranch.id,

          fullName,
          email,
          password: hashedPassword,

          role: "CLINIC_ADMIN",

          status: "active",
        },
      });

      /*
      -------------------------------------------------------
      4. CONNECT CLINIC OWNER
      -------------------------------------------------------
      */

      const updatedClinic = await tx.clinic.update({
        where: {
          id: clinic.id,
        },

        data: {
          ownerId: user.id,
        },
      });

      return {
        clinic: updatedClinic,
        branch: mainBranch,
        user,
      };
    });

    /*
    =========================================================
    SUCCESS RESPONSE
    =========================================================
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Clinic, main branch, and administrator account created successfully.",

        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role,
          clinicId: result.user.clinicId,
          branchId: result.user.branchId,
        },

        clinic: {
          id: result.clinic.id,
          name: result.clinic.name,
          slug: result.clinic.slug,
        },

      branch: {
      id: result.branch.id,
      name: result.branch.name,
      isMain: true,
    },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}