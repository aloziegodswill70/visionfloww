
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

/**
 * =========================================================
 * GET CURRENT TENANT
 * =========================================================
 *
 * Returns the authenticated clinic user's tenant context.
 *
 * SUPER_ADMIN is intentionally rejected here because
 * SUPER_ADMIN is a platform-level account and does not
 * require a clinicId.
 */
export async function getTenant() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session.user.clinicId) {
    throw new Error("Clinic not found");
  }

  return {
    clinicId: session.user.clinicId,
    branchId: session.user.branchId ?? null,
    role: session.user.role,
    fullName: session.user.name,
    userId: session.user.id,
  };
}

/**
 * =========================================================
 * GET TENANT WHERE CLAUSE
 * =========================================================
 *
 * This helper creates the base Prisma filter for clinic
 * tenant isolation.
 *
 * Clinic Admin:
 *   Can access all branches belonging to their clinic.
 *
 * Other clinic users:
 *   If assigned to a branch, they are restricted to that
 *   branch.
 *
 * Users without a branch:
 *   Remain restricted to their clinic.
 */
export async function getTenantWhere() {
  const tenant = await getTenant();

  const where: Record<string, unknown> = {
    clinicId: tenant.clinicId,
  };

  /*
  ---------------------------------------------------------
  CLINIC ADMIN
  ---------------------------------------------------------

  Clinic Admin can manage the entire clinic, including
  multiple branches.
  */
  if (
    tenant.role !== "CLINIC_ADMIN" &&
    tenant.branchId
  ) {
    where.branchId = tenant.branchId;
  }

  return where;
}
