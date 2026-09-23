export type ReminderChannel = "whatsapp";

export type ReminderType =
  | "appointment"
  | "follow_up"
  | "medication"
  | "optical_pickup";

export interface ScheduledReminder {
  id: string;
  clinicId: string;
  patientName: string;
  type: ReminderType;
  channel: ReminderChannel;
  title: string;
  message: string;
  scheduledFor: string;
  status: "scheduled" | "sent" | "failed" | "cancelled";
}