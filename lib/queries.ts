import {
  appointments,
  branches,
  clinics,
  currentClinicId,
  opticalOrders,
  patients,
  staffUsers,
  whatsappAccounts,
  whatsappMessages,
  automationWorkflows,
  medicationReminders,
  followUpReminders,
  agentQueue,
} from "@/lib/data";

export function getClinicById(clinicId = currentClinicId) {
  return clinics.find((clinic) => clinic.id === clinicId);
}

export function getClinicBranches(clinicId = currentClinicId) {
  return branches.filter((branch) => branch.clinicId === clinicId);
}

export function getClinicStaff(clinicId = currentClinicId) {
  return staffUsers.filter((staff) => staff.clinicId === clinicId);
}

export function getClinicPatients(clinicId = currentClinicId) {
  return patients.filter((patient) => patient.clinicId === clinicId);
}

export function getClinicAppointments(clinicId = currentClinicId) {
  return appointments.filter(
    (appointment) => appointment.clinicId === clinicId
  );
}

export function getClinicPendingAppointments(
  clinicId = currentClinicId
) {
  return appointments.filter(
    (appointment) =>
      appointment.clinicId === clinicId &&
      (
        appointment.status ===
          "PENDING_RECEPTION_CONFIRMATION" ||
        appointment.status === "RECEPTION_CONFIRMED"
      )
  );
}

export function getClinicDoctorQueue(
  clinicId = currentClinicId
) {
  return appointments.filter(
    (appointment) =>
      appointment.clinicId === clinicId &&
      (
        appointment.status === "CHECKED_IN" ||
        appointment.status === "IN_CONSULTATION"
      )
  );
}

export function getClinicMissedAppointments(
  clinicId = currentClinicId
) {
  return appointments.filter(
    (appointment) =>
      appointment.clinicId === clinicId &&
      appointment.status === "MISSED"
  );
}

export function getClinicWhatsAppMessages(
  clinicId = currentClinicId
) {
  return whatsappMessages.filter(
    (message) => message.clinicId === clinicId
  );
}

export function getClinicOpticalOrders(
  clinicId = currentClinicId
) {
  return opticalOrders.filter(
    (order) => order.clinicId === clinicId
  );
}

export function getClinicMedicationReminders(
  clinicId = currentClinicId
) {
  return medicationReminders.filter(
    (reminder) => reminder.clinicId === clinicId
  );
}

export function getClinicFollowUpReminders(
  clinicId = currentClinicId
) {
  return followUpReminders.filter(
    (reminder) => reminder.clinicId === clinicId
  );
}

export function getClinicAgentQueue(
  clinicId = currentClinicId
) {
  return agentQueue.filter(
    (item) => item.clinicId === clinicId
  );
}

export function getClinicWhatsAppAccount(
  clinicId = currentClinicId
) {
  return whatsappAccounts.find(
    (account) => account.clinicId === clinicId
  );
}

export function getClinicAutomationWorkflows(
  clinicId = currentClinicId
) {
  return automationWorkflows.filter(
    (workflow) => workflow.clinicId === clinicId
  );
}

export function getBranchById(branchId: string) {
  return branches.find(
    (branch) => branch.id === branchId
  );
}

export function getPatientById(patientId: string) {
  return patients.find(
    (patient) => patient.id === patientId
  );
}