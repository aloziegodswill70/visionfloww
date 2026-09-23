/*
  Warnings:

  - A unique constraint covering the columns `[clinicId,name]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId]` on the table `Clinic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FollowUpReminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MedicationReminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "public"."Branch" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Clinic" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "public"."FollowUpReminder" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."MedicationReminder" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Patient" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "clinicId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."WhatsAppMessage" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "messageId" TEXT,
ADD COLUMN     "whatsappAccountId" TEXT;

-- CreateTable
CREATE TABLE "public"."WhatsAppAccount" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "branchId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'meta_cloud_api',
    "phoneNumber" TEXT,
    "displayName" TEXT,
    "phoneNumberId" TEXT,
    "businessAccountId" TEXT,
    "accessTokenEncrypted" TEXT,
    "verifyTokenHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastConnectedAt" TIMESTAMP(3),
    "lastWebhookAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAccount_phoneNumberId_key" ON "public"."WhatsAppAccount"("phoneNumberId");

-- CreateIndex
CREATE INDEX "WhatsAppAccount_clinicId_idx" ON "public"."WhatsAppAccount"("clinicId");

-- CreateIndex
CREATE INDEX "WhatsAppAccount_branchId_idx" ON "public"."WhatsAppAccount"("branchId");

-- CreateIndex
CREATE INDEX "AuditLog_clinicId_idx" ON "public"."AuditLog"("clinicId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_idx" ON "public"."Appointment"("clinicId");

-- CreateIndex
CREATE INDEX "Appointment_branchId_idx" ON "public"."Appointment"("branchId");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "public"."Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_date_idx" ON "public"."Appointment"("clinicId", "date");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_status_idx" ON "public"."Appointment"("clinicId", "status");

-- CreateIndex
CREATE INDEX "Branch_clinicId_idx" ON "public"."Branch"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_clinicId_name_key" ON "public"."Branch"("clinicId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_ownerId_key" ON "public"."Clinic"("ownerId");

-- CreateIndex
CREATE INDEX "ExecutionLog_clinicId_idx" ON "public"."ExecutionLog"("clinicId");

-- CreateIndex
CREATE INDEX "ExecutionLog_clinicId_createdAt_idx" ON "public"."ExecutionLog"("clinicId", "createdAt");

-- CreateIndex
CREATE INDEX "FollowUpReminder_clinicId_idx" ON "public"."FollowUpReminder"("clinicId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_branchId_idx" ON "public"."FollowUpReminder"("branchId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_patientId_idx" ON "public"."FollowUpReminder"("patientId");

-- CreateIndex
CREATE INDEX "MedicationReminder_clinicId_idx" ON "public"."MedicationReminder"("clinicId");

-- CreateIndex
CREATE INDEX "MedicationReminder_branchId_idx" ON "public"."MedicationReminder"("branchId");

-- CreateIndex
CREATE INDEX "MedicationReminder_patientId_idx" ON "public"."MedicationReminder"("patientId");

-- CreateIndex
CREATE INDEX "OpticalOrder_clinicId_idx" ON "public"."OpticalOrder"("clinicId");

-- CreateIndex
CREATE INDEX "OpticalOrder_branchId_idx" ON "public"."OpticalOrder"("branchId");

-- CreateIndex
CREATE INDEX "OpticalOrder_patientId_idx" ON "public"."OpticalOrder"("patientId");

-- CreateIndex
CREATE INDEX "Patient_clinicId_idx" ON "public"."Patient"("clinicId");

-- CreateIndex
CREATE INDEX "Patient_branchId_idx" ON "public"."Patient"("branchId");

-- CreateIndex
CREATE INDEX "Patient_clinicId_phone_idx" ON "public"."Patient"("clinicId", "phone");

-- CreateIndex
CREATE INDEX "User_clinicId_idx" ON "public"."User"("clinicId");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "public"."User"("branchId");

-- CreateIndex
CREATE INDEX "User_clinicId_branchId_idx" ON "public"."User"("clinicId", "branchId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_clinicId_idx" ON "public"."WhatsAppMessage"("clinicId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_branchId_idx" ON "public"."WhatsAppMessage"("branchId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_patientId_idx" ON "public"."WhatsAppMessage"("patientId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_whatsappAccountId_idx" ON "public"."WhatsAppMessage"("whatsappAccountId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_clinicId_createdAt_idx" ON "public"."WhatsAppMessage"("clinicId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Clinic" ADD CONSTRAINT "Clinic_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WhatsAppAccount" ADD CONSTRAINT "WhatsAppAccount_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WhatsAppAccount" ADD CONSTRAINT "WhatsAppAccount_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "public"."WhatsAppAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpticalOrder" ADD CONSTRAINT "OpticalOrder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpticalOrder" ADD CONSTRAINT "OpticalOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicationReminder" ADD CONSTRAINT "MedicationReminder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicationReminder" ADD CONSTRAINT "MedicationReminder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "public"."Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
