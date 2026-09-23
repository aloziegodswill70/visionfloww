import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * DASHBOARD OVERVIEW
 * - total patients
 * - total appointments
 * - total branches
 * - today's appointments
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.clinicId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clinicId = session.user.clinicId;

    const [
      totalPatients,
      totalAppointments,
      totalBranches,
      todayAppointments,
    ] = await Promise.all([
      prisma.patient.count({
        where: { clinicId },
      }),

      prisma.appointment.count({
        where: { clinicId },
      }),

      prisma.branch.count({
        where: { clinicId },
      }),

      prisma.appointment.count({
        where: {
          clinicId,
          date: new Date().toISOString().split("T")[0],
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalPatients,
        totalAppointments,
        totalBranches,
        todayAppointments,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}