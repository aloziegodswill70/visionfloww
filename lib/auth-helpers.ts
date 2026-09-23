
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

/**
 * =========================================================
 * GET AUTHENTICATED SESSION
 * =========================================================
 *
 * Returns the current NextAuth session.
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * =========================================================
 * REQUIRE AUTHENTICATED USER
 * =========================================================
 *
 * Any authenticated VisionFlow user can pass this check.
 *
 * This includes:
 *
 * - SUPER_ADMIN
 * - CLINIC_ADMIN
 * - DOCTOR
 * - RECEPTIONIST
 * - OPTICIAN
 * - ACCOUNTANT
 * - MANAGER
 */
export async function requireAuth() {
  const session = await getAuthSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/**
 * =========================================================
 * REQUIRE SUPER ADMIN
 * =========================================================
 *
 * SUPER_ADMIN is a platform-level user and does NOT
 * necessarily belong to a clinic.
 */
export async function requireSuperAdmin() {
  const user = await requireAuth();

  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
}

/**
 * =========================================================
 * REQUIRE CLINIC USER
 * =========================================================
 *
 * Used by clinic-level API routes.
 *
 * A clinic user must have a clinicId.
 *
 * SUPER_ADMIN should use requireSuperAdmin() when working
 * with platform-level functionality.
 */
export async function requireClinicUser() {
  const user = await requireAuth();

  if (!user.clinicId) {
    throw new Error("Clinic not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
    branchId: user.branchId ?? null,
  };
}

/**
 * =========================================================
 * CURRENT CLINIC ID
 * =========================================================
 */
export async function getClinicId() {
  const user = await requireClinicUser();

  return user.clinicId;
}

/**
 * =========================================================
 * CURRENT BRANCH ID
 * =========================================================
 */
export async function getBranchId() {
  const user = await requireClinicUser();

  return user.branchId;
}

/**
 * =========================================================
 * ROLE CHECKS
 * =========================================================
 */

export async function isSuperAdmin() {
  const user = await requireAuth();

  return user.role === "SUPER_ADMIN";
}

export async function isClinicAdmin() {
  const user = await requireClinicUser();

  return user.role === "CLINIC_ADMIN";
}

export async function isDoctor() {
  const user = await requireClinicUser();

  return user.role === "DOCTOR";
}

export async function isReceptionist() {
  const user = await requireClinicUser();

  return user.role === "RECEPTIONIST";
}

export async function isOptician() {
  const user = await requireClinicUser();

  return user.role === "OPTICIAN";
}

export async function isAccountant() {
  const user = await requireClinicUser();

  return user.role === "ACCOUNTANT";
}

export async function isManager() {
  const user = await requireClinicUser();

  return user.role === "MANAGER";
}

/**
 * =========================================================
 * BRANCH ACCESS
 * =========================================================
 *
 * Checks whether the authenticated clinic user belongs
 * to the requested branch.
 */
export async function belongsToBranch(branchId: string) {
  const user = await requireClinicUser();

  /*
   * A user without a branch assignment cannot be considered
   * a member of a specific branch.
   */
  if (!user.branchId) {
    return false;
  }

  return user.branchId === branchId;
}

/**
 * =========================================================
 * ROLE GUARD
 * =========================================================
 *
 * Example:
 *
 * await requireRole("CLINIC_ADMIN");
 *
 * Or:
 *
 * await requireRole("CLINIC_ADMIN", "MANAGER");
 */
export async function requireRole(...roles: string[]) {
  const user = await requireClinicUser();

  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}

