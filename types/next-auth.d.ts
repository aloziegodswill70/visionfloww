import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;

      /**
       * SUPER_ADMIN may not belong to a clinic.
       * Clinic users will always have a clinicId.
       */
      clinicId?: string | null;

      /**
       * Branch assignment is optional.
       * A clinic admin may later manage multiple branches.
       */
      branchId?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;

    clinicId?: string | null;

    branchId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;

    email?: string;

    name?: string;

    role: string;

    clinicId?: string | null;

    branchId?: string | null;
  }
}