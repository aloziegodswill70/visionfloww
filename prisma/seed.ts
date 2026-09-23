import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@visionflowwhatsapp.com";
  const password = "ChangeMe123!";
  const fullName = "VisionFlow Platform Admin";

  const hashedPassword = await bcrypt.hash(password, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== UserRole.SUPER_ADMIN) {
      throw new Error(
        `A user already exists with ${email}, but that user is not a SUPER_ADMIN.`
      );
    }

    console.log("========================================");
    console.log("SUPER_ADMIN already exists");
    console.log("========================================");
    console.log(`Email: ${email}`);
    console.log(`Role: ${existingAdmin.role}`);
    console.log("========================================");

    return;
  }

  const admin = await prisma.user.create({
    data: {
      fullName: fullName,
      email: email,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: "active",
    },
  });

  console.log("========================================");
  console.log("VisionFlow SUPER_ADMIN created");
  console.log("========================================");
  console.log(`ID: ${admin.id}`);
  console.log(`Name: ${admin.fullName}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
  console.log("Clinic: None");
  console.log("Branch: None");
  console.log("========================================");
  console.log("IMPORTANT: Change the default password after login.");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });