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

type ClinicUser = Awaited<ReturnType<typeof requireClinicUser>>;

function getPatientAccessWhere(id: string, user: ClinicUser) {
  return {
    id,
    clinicId: user.clinicId,
    ...(user.role !== "CLINIC_ADMIN" && user.branchId
      ? { branchId: user.branchId }
      : {}),
  };
}

function getBranchScope(user: ClinicUser) {
  if (user.role !== "CLINIC_ADMIN" && user.branchId) {
    return {
      branchId: user.branchId,
    };
  }

  return {};
}

async function getPatientForUser(id: string, user: ClinicUser) {
  return prisma.patient.findFirst({
    where: getPatientAccessWhere(id, user),
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          isMain: true,
          isActive: true,
        },
      },
    },
  });
}

/* =========================================================
   GET PATIENT PROFILE
   ========================================================= */

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireClinicUser();
    const { id } = await context.params;

    const branchScope = getBranchScope(user);

    /*
     * IMPORTANT:
     *
     * This is now ONE patient lookup.
     *
     * The previous version first called getPatientForUser()
     * and then queried the same patient again to load history.
     *
     * The tenant/branch restriction is applied directly to
     * this query, so the patient is authorized and loaded
     * in one operation.
     */
    const patientWithHistory = await prisma.patient.findFirst({
      where: getPatientAccessWhere(id, user),

      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            isMain: true,
            isActive: true,
          },
        },

        appointments: {
          where: {
            clinicId: user.clinicId,
            ...branchScope,
          },
          orderBy: [
            {
              date: "desc",
            },
            {
              time: "desc",
            },
          ],
          take: 50,
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        whatsappMessages: {
          where: {
            clinicId: user.clinicId,
            ...branchScope,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },

        opticalOrders: {
          where: {
            clinicId: user.clinicId,
            ...branchScope,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        medicationReminders: {
          where: {
            clinicId: user.clinicId,
            ...branchScope,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        followUpReminders: {
          where: {
            clinicId: user.clinicId,
            ...branchScope,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!patientWithHistory) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      appointments,
      whatsappMessages,
      opticalOrders,
      medicationReminders,
      followUpReminders,
      ...patientData
    } = patientWithHistory;

    return NextResponse.json({
      success: true,
      patient: patientData,
      history: {
        appointments,
        whatsappMessages,
        opticalOrders,
        medicationReminders,
        followUpReminders,
      },
    });
  } catch (error) {
    console.error("GET PATIENT ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load patient.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message === "Unauthorized"
            ? 401
            : message === "Clinic not found"
              ? 403
              : 500,
      }
    );
  }
}

/* =========================================================
   UPDATE PATIENT
   ========================================================= */

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireClinicUser();

    if (!canWrite(user.role)) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to update patients.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await context.params;

    const existingPatient = await getPatientForUser(id, user);

    if (!existingPatient) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body = await req.json();

    const fullName = body.fullName?.trim();
    const phone = normalizePhone(body.phone || "");
    const gender = body.gender?.trim() || null;
    const status = body.status?.trim();
    const requestedBranchId = body.branchId?.trim() || "";

    if (!fullName) {
      return NextResponse.json(
        {
          error: "Patient full name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (fullName.length > 150) {
      return NextResponse.json(
        {
          error: "Patient name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error: "Patient phone number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (phone.length < 7 || phone.length > 30) {
      return NextResponse.json(
        {
          error: "Please enter a valid phone number.",
        },
        {
          status: 400,
        }
      );
    }

    if (!["Active", "Inactive"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid patient status.",
        },
        {
          status: 400,
        }
      );
    }

    let branchId = existingPatient.branch?.id ?? null;

    /*
     * Branch users cannot move patients outside their
     * assigned branch.
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
          {
            error:
              "Selected branch was not found or is inactive.",
          },
          {
            status: 400,
          }
        );
      }

      branchId = branch.id;
    } else {
      branchId = null;
    }

    /*
     * Check for another patient with the same phone and name.
     */
    const duplicatePatients = await prisma.patient.findMany({
      where: {
        clinicId: user.clinicId,
        phone,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
        fullName: true,
      },
      take: 20,
    });

    const duplicate = duplicatePatients.find(
      (patient) =>
        patient.fullName.trim().toLowerCase() ===
        fullName.toLowerCase()
    );

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Another patient with this name and phone number already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * Update is additionally protected by clinic ownership.
     * The patient was already verified above, but keeping the
     * clinic condition here prevents cross-tenant updates.
     */
    const patient = await prisma.patient.updateMany({
      where: {
        id,
        clinicId: user.clinicId,
        ...(user.role !== "CLINIC_ADMIN" && user.branchId
          ? { branchId: user.branchId }
          : {}),
      },
      data: {
        fullName,
        phone,
        gender,
        status,
        branchId,
      },
    });

    if (patient.count === 0) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedPatient = await prisma.patient.findFirst({
      where: {
        id,
        clinicId: user.clinicId,
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

    return NextResponse.json({
      success: true,
      message: "Patient updated successfully.",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("UPDATE PATIENT ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update patient.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message === "Unauthorized"
            ? 401
            : message === "Clinic not found"
              ? 403
              : 500,
      }
    );
  }
}

/* =========================================================
   DELETE PATIENT
   ========================================================= */

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireClinicUser();

    if (user.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        {
          error:
            "Only the clinic administrator can permanently delete patients.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await context.params;

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        clinicId: user.clinicId,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      return NextResponse.json(
        {
          error: "Patient not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Check dependencies sequentially.
     *
     * We intentionally do not use Promise.all here because
     * Railway/PostgreSQL connection limits are important for
     * this application.
     */

    const appointmentCount = await prisma.appointment.count({
      where: {
        patientId: id,
        clinicId: user.clinicId,
      },
    });

    if (appointmentCount > 0) {
      return NextResponse.json(
        {
          error:
            "This patient has clinical or communication history and cannot be permanently deleted. Deactivate the patient instead.",
        },
        {
          status: 409,
        }
      );
    }

    const messageCount = await prisma.whatsAppMessage.count({
      where: {
        patientId: id,
        clinicId: user.clinicId,
      },
    });

    if (messageCount > 0) {
      return NextResponse.json(
        {
          error:
            "This patient has clinical or communication history and cannot be permanently deleted. Deactivate the patient instead.",
        },
        {
          status: 409,
        }
      );
    }

    const opticalOrderCount = await prisma.opticalOrder.count({
      where: {
        patientId: id,
        clinicId: user.clinicId,
      },
    });

    if (opticalOrderCount > 0) {
      return NextResponse.json(
        {
          error:
            "This patient has clinical or communication history and cannot be permanently deleted. Deactivate the patient instead.",
        },
        {
          status: 409,
        }
      );
    }

    const medicationCount =
      await prisma.medicationReminder.count({
        where: {
          patientId: id,
          clinicId: user.clinicId,
        },
      });

    if (medicationCount > 0) {
      return NextResponse.json(
        {
          error:
            "This patient has clinical or communication history and cannot be permanently deleted. Deactivate the patient instead.",
        },
        {
          status: 409,
        }
      );
    }

    const followUpCount =
      await prisma.followUpReminder.count({
        where: {
          patientId: id,
          clinicId: user.clinicId,
        },
      });

    if (followUpCount > 0) {
      return NextResponse.json(
        {
          error:
            "This patient has clinical or communication history and cannot be permanently deleted. Deactivate the patient instead.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.patient.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Patient deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PATIENT ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete patient.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message === "Unauthorized"
            ? 401
            : message === "Clinic not found"
              ? 403
              : 500,
      }
    );
  }
}