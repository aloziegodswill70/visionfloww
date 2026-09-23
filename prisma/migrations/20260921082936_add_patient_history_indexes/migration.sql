-- CreateIndex
CREATE INDEX "Appointment_clinicId_patientId_idx" ON "public"."Appointment"("clinicId", "patientId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_clinicId_patientId_idx" ON "public"."FollowUpReminder"("clinicId", "patientId");

-- CreateIndex
CREATE INDEX "MedicationReminder_clinicId_patientId_idx" ON "public"."MedicationReminder"("clinicId", "patientId");

-- CreateIndex
CREATE INDEX "OpticalOrder_clinicId_patientId_idx" ON "public"."OpticalOrder"("clinicId", "patientId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_clinicId_patientId_idx" ON "public"."WhatsAppMessage"("clinicId", "patientId");
