// lib/types.ts

/* ===========================================================
   USER ROLES
=========================================================== */

export type UserRole =
  | "SUPER_ADMIN"
  | "CLINIC_ADMIN"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "OPTICIAN"
  | "ACCOUNTANT"
  | "MANAGER";

/* ===========================================================
   SUBSCRIPTION
=========================================================== */

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "cancelled";

/* ===========================================================
   APPOINTMENT STATUS
=========================================================== */

export type AppointmentStatus =
  | "PENDING_RECEPTION_CONFIRMATION"
  | "RECEPTION_CONFIRMED"
  | "PATIENT_CONFIRMED"
  | "CHECKED_IN"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED"
  | "RESCHEDULED";

/* ===========================================================
   REMINDER STATUS
=========================================================== */

export type ReminderStatus =
  | "SCHEDULED"
  | "SENT"
  | "FAILED"
  | "CANCELLED";

/* ===========================================================
   CLINIC
=========================================================== */

export interface Clinic {
  id: string;
  name: string;
  slug: string;

  email?: string | null;
  phone?: string | null;

  plan: string;
  subscriptionStatus: SubscriptionStatus;

  openingHour: string;
  closingHour: string;

  workingDays: string[];

  isActive?: boolean;

  ownerId?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   BRANCH
=========================================================== */

export interface Branch {
  id: string;

  clinicId: string;

  name: string;
  address?: string | null;
  phone?: string | null;

  isMain?: boolean;
  isActive?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   STAFF USER
=========================================================== */

export interface StaffUser {
  id: string;

  clinicId?: string | null;
  branchId?: string | null;

  fullName: string;
  email: string;

  role: UserRole;

  status: string;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   PATIENT
=========================================================== */

export interface Patient {
  id: string;

  clinicId: string;
  branchId?: string | null;

  fullName: string;
  phone: string;

  gender?: string | null;

  status: string;

  lastVisit?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   APPOINTMENT
=========================================================== */

export interface Appointment {
  id: string;

  clinicId: string;
  branchId: string;

  patientId?: string | null;

  patientName: string;
  phone: string;

  reason: string;

  date: string;
  time: string;

  notes?: string | null;

  status: AppointmentStatus;

  patientConfirmed: boolean;
  receptionistConfirmed: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   WHATSAPP MESSAGE
=========================================================== */

export interface WhatsAppMessage {
  id: string;

  clinicId: string;
  branchId?: string | null;
  patientId?: string | null;
  whatsappAccountId?: string | null;

  patientName?: string | null;
  phone?: string | null;

  direction: string;

  text: string;

  status: string;

  intent?: string | null;

  messageId?: string | null;

  createdAt?: Date;
}

/* ===========================================================
   OPTICAL ORDER
=========================================================== */

export interface OpticalOrder {
  id: string;

  clinicId: string;
  branchId: string;

  patientId?: string | null;

  patientName: string;

  lensType: string;

  status: string;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   MEDICATION REMINDER
=========================================================== */

export interface MedicationReminder {
  id: string;

  clinicId: string;
  branchId: string;

  patientId?: string | null;

  patientName: string;

  medicationName: string;

  dosageInstruction: string;

  frequency: string;

  reminderTime: string;

  startDate: string;
  endDate: string;

  status: ReminderStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   FOLLOW-UP REMINDER
=========================================================== */

export interface FollowUpReminder {
  id: string;

  clinicId: string;
  branchId: string;

  patientId?: string | null;

  patientName: string;

  followUpDate: string;
  followUpTime: string;

  reason: string;

  reminderSchedule: string[];

  status: ReminderStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ===========================================================
   EXECUTION LOG
=========================================================== */

export interface ExecutionLog {
  id: string;

  clinicId: string;

  workflowName: string;

  patientName?: string | null;

  action: string;

  status: string;

  message: string;

  createdAt?: Date;
}

/* ===========================================================
   AGENT QUEUE
=========================================================== */

export interface AgentQueueItem {
  id: string;

  clinicId: string;

  patientName?: string;
  phone?: string;

  message: string;

  intent: string;

  priority: "normal" | "urgent";

  status: "waiting" | "assigned" | "resolved";

  assignedTo?: string;

  createdAt: string;
}

/* ===========================================================
   WHATSAPP ACCOUNT
=========================================================== */

export interface WhatsAppAccount {
  id: string;

  clinicId: string;

  branchId?: string | null;

  phoneNumber?: string | null;

  displayName?: string | null;

  provider:
    | "meta_cloud_api"
    | "twilio"
    | "manual";

  status: string;
}

/* ===========================================================
   AUTOMATION WORKFLOW
=========================================================== */

export interface AutomationWorkflow {
  id: string;

  clinicId: string;

  name: string;

  trigger:
    | "appointment_requested"
    | "appointment_created"
    | "appointment_confirmed"
    | "appointment_reminder"
    | "appointment_missed"
    | "medication_reminder"
    | "optical_ready"
    | "visit_completed"
    | "follow_up_due"
    | "new_whatsapp_message"
    | "unknown_message";

  channel: "whatsapp";

  enabled: boolean;

  template: string;
}