import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * =====================================================
 * DASHBOARD OVERVIEW API
 *
 * Returns key clinic metrics for the logged-in clinic.
 * =====================================================
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.clinicId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const clinicId = session.user.clinicId;

    /**
     * =====================================================
     * GET TODAY AS YYYY-MM-DD
     *
     * Appointment.date is stored as a String in Prisma.
     * =====================================================
     */
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const today = `${year}-${month}-${day}`;

    /**
     * =====================================================
     * RUN DASHBOARD COUNTS IN PARALLEL
     * =====================================================
     */
    const [
      totalPatients,
      totalAppointments,
      totalBranches,
      todayAppointments,
      pendingAppointments,
    ] = await Promise.all([
      /**
       * Total patients
       */
      prisma.patient.count({
        where: {
          clinicId,
        },
      }),

      /**
       * Total appointments
       */
      prisma.appointment.count({
        where: {
          clinicId,
        },
      }),

      /**
       * Total branches
       */
      prisma.branch.count({
        where: {
          clinicId,
        },
      }),

      /**
       * Today's appointments
       */
      prisma.appointment.count({
        where: {
          clinicId,
          date: today,
        },
      }),

      /**
       * Appointments awaiting receptionist confirmation
       */
      prisma.appointment.count({
        where: {
          clinicId,
          status: "PENDING_RECEPTION_CONFIRMATION",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      stats: {
        totalPatients,
        totalAppointments,
        totalBranches,
        todayAppointments,
        pendingAppointments,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard overview.",
      },
      {
        status: 500,
      }
    );
  }
}