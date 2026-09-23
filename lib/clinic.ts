import { prisma } from "@/lib/prisma";

/**
 * Get clinic by ID
 */
export async function getClinicById(clinicId: string) {
  return prisma.clinic.findUnique({
    where: {
      id: clinicId,
    },
  });
}

/**
 * Get clinic by slug
 */
export async function getClinicBySlug(slug: string) {
  return prisma.clinic.findUnique({
    where: {
      slug,
    },
  });
}

/**
 * Check whether a clinic exists
 */
export async function clinicExists(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: {
      id: clinicId,
    },
    select: {
      id: true,
    },
  });

  return !!clinic;
}