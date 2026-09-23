import {
  appointments,
  currentClinicId,
  followUpReminders,
  medicationReminders,
  opticalOrders,
} from "@/lib/data";
import { getBranchById } from "@/lib/queries";
import { ScheduledReminder } from "./reminder-rules";

function normalizeReminderStatus(
  status: string
): ScheduledReminder["status"] {
  switch (status.toUpperCase()) {
    case "SENT":
      return "sent";

    case "FAILED":
      return "failed";

    case "CANCELLED":
      return "cancelled";

    case "SCHEDULED":
    default:
      return "scheduled";
  }
}

export function getScheduledReminders(
  clinicId = currentClinicId
): ScheduledReminder[] {
  const appointmentReminders: ScheduledReminder[] =
    appointments
      .filter(
        (appointment) =>
          appointment.clinicId === clinicId &&
          appointment.status === "PATIENT_CONFIRMED"
      )
      .map((appointment) => ({
        id: `appointment_${appointment.id}`,
        clinicId: appointment.clinicId,
        patientName: appointment.patientName,
        type: "appointment",
        channel: "whatsapp",
        title: "Appointment Reminder",
        message: `Hello ${appointment.patientName}, this is a reminder for your appointment on ${appointment.date} by ${appointment.time}.`,
        scheduledFor: "2 days before and 12 hours before",
        status: "scheduled",
      }));

  const followUpScheduledReminders: ScheduledReminder[] =
    followUpReminders
      .filter(
        (reminder) =>
          reminder.clinicId === clinicId
      )
      .map((reminder) => ({
        id: `followup_${reminder.id}`,
        clinicId: reminder.clinicId,
        patientName: reminder.patientName,
        type: "follow_up",
        channel: "whatsapp",
        title: "Follow-Up Reminder",
        message: `Hello ${reminder.patientName}, this is a reminder for your follow-up appointment on ${reminder.followUpDate} by ${reminder.followUpTime}.`,
        scheduledFor: reminder.reminderSchedule.join(", "),
        status: normalizeReminderStatus(reminder.status),
      }));

  const medicationScheduledReminders: ScheduledReminder[] =
    medicationReminders
      .filter(
        (reminder) =>
          reminder.clinicId === clinicId
      )
      .map((reminder) => ({
        id: `medication_${reminder.id}`,
        clinicId: reminder.clinicId,
        patientName: reminder.patientName,
        type: "medication",
        channel: "whatsapp",
        title: "Medication Reminder",
        message: `Hello ${reminder.patientName}, please remember: ${reminder.dosageInstruction}`,
        scheduledFor: `${reminder.frequency} at ${reminder.reminderTime}`,
        status: normalizeReminderStatus(reminder.status),
      }));

  const opticalPickupReminders: ScheduledReminder[] =
    opticalOrders
      .filter(
        (order) =>
          order.clinicId === clinicId &&
          order.status === "Ready"
      )
      .map((order) => {
        const branch = getBranchById(
          order.branchId
        );

        return {
          id: `optical_${order.id}`,
          clinicId: order.clinicId,
          patientName: order.patientName,
          type: "optical_pickup",
          channel: "whatsapp",
          title: "Optical Pickup Reminder",
          message: `Hello ${order.patientName}, your prescribed glasses are ready for pickup at ${
            branch?.name ?? "our clinic"
          }.`,
          scheduledFor:
            "Immediately, then every 3 days until pickup",
          status: "scheduled",
        };
      });

  return [
    ...appointmentReminders,
    ...followUpScheduledReminders,
    ...medicationScheduledReminders,
    ...opticalPickupReminders,
  ];
}