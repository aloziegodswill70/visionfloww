import { prisma } from "@/lib/prisma";

/**
 * Get one branch
 */
export async function getBranch(branchId: string) {
  return prisma.branch.findUnique({
    where: {
      id: branchId,
    },
  });
}

/**
 * Get all branches for a clinic
 */
export async function getClinicBranches(
  clinicId: string
) {
  return prisma.branch.findMany({
    where: {
      clinicId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Get branch name
 */
export async function getBranchName(
  branchId: string
) {
  const branch = await prisma.branch.findUnique({
    where: {
      id: branchId,
    },
    select: {
      name: true,
    },
  });

  return branch?.name ?? "Unknown Branch";
}

/**
 * Check branch ownership
 */
export async function belongsToClinic(
  branchId: string,
  clinicId: string
) {
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      clinicId,
    },
    select: {
      id: true,
    },
  });

  return !!branch;
}