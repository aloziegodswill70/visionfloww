import {
  Appointment,
  AutomationWorkflow,
  Branch,
  Clinic,
  OpticalOrder,
  Patient,
  StaffUser,
  WhatsAppAccount,
  WhatsAppMessage,
  MedicationReminder,
  FollowUpReminder,
  AgentQueueItem,
} from "./types";

/**
 * =========================================================
 * CURRENT DEMO CLINIC
 * =========================================================
 *
 * These records are frontend/demo data.
 *
 * The real authenticated application will eventually use
 * Prisma/PostgreSQL data instead.
 */
export const currentClinicId = "clinic_justvision";

/**
 * =========================================================
 * CLINICS
 * =========================================================
 */
export const clinics: Clinic[] = [
  {
    id: "clinic_justvision",
    name: "Just Vision Eye Centre",
    slug: "just-vision-eye-centre",
    email: "info@justvisionseyecentre.com.ng",
    phone: "+234 800 000 0000",
    plan: "Growth",
    subscriptionStatus: "active",
    openingHour: "08:00",
    closingHour: "18:00",
    workingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  },

  {
    id: "clinic_havana",
    name: "Havana Eye Clinic",
    slug: "havana-eye-clinic",
    email: "hello@havanaeyeclinic.com",
    phone: "+234 811 000 0000",
    plan: "Starter",
    subscriptionStatus: "trial",
    openingHour: "08:00",
    closingHour: "17:00",
    workingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  },
];

/**
 * =========================================================
 * BRANCHES
 * =========================================================
 */
export const branches: Branch[] = [
  {
    id: "branch_ikeja",
    clinicId: "clinic_justvision",
    name: "Ikeja Branch",
    address: "Ikeja, Lagos",
    phone: "+234 801 234 5678",
  },

  {
    id: "branch_surulere",
    clinicId: "clinic_justvision",
    name: "Surulere Branch",
    address: "Surulere, Lagos",
    phone: "+234 802 345 6789",
  },
];

/**
 * =========================================================
 * STAFF USERS
 * =========================================================
 */
export const staffUsers: StaffUser[] = [
  {
    id: "staff_1",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    fullName: "Dr. Godswill Alozie",
    email: "doctor@justvisionseyecentre.com.ng",
    role: "CLINIC_ADMIN",
    status: "ACTIVE",
  },

  {
    id: "staff_2",
    clinicId: "clinic_justvision",
    branchId: "branch_surulere",
    fullName: "Front Desk Officer",
    email: "frontdesk@justvisionseyecentre.com.ng",
    role: "RECEPTIONIST",
    status: "ACTIVE",
  },
];

/**
 * =========================================================
 * PATIENTS
 * =========================================================
 */
export const patients: Patient[] = [
  {
    id: "patient_1",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    fullName: "Ada Johnson",
    phone: "+234 801 234 5678",
    gender: "Female",
    lastVisit: "Today",
    status: "ACTIVE",
  },

  {
    id: "patient_2",
    clinicId: "clinic_justvision",
    branchId: "branch_surulere",
    fullName: "Chinedu Okafor",
    phone: "+234 802 345 6789",
    gender: "Male",
    lastVisit: "Yesterday",
    status: "REVIEW",
  },

  {
    id: "patient_3",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    fullName: "Mary Peters",
    phone: "+234 803 456 7890",
    gender: "Female",
    lastVisit: "3 days ago",
    status: "OPTICAL",
  },
];

/**
 * =========================================================
 * APPOINTMENTS
 * =========================================================
 *
 * Canonical appointment statuses:
 *
 * PENDING_RECEPTION_CONFIRMATION
 * RECEPTION_CONFIRMED
 * PATIENT_CONFIRMED
 * CHECKED_IN
 * IN_CONSULTATION
 * COMPLETED
 * CANCELLED
 * MISSED
 * RESCHEDULED
 */
export const appointments: Appointment[] = [
  {
    id: "apt_1",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    patientId: "patient_1",
    patientName: "Ada Johnson",
    phone: "+234 801 234 5678",
    reason: "Routine eye test",
    date: "2026-05-14",
    time: "9:00 AM",
    status: "PATIENT_CONFIRMED",
    patientConfirmed: true,
    receptionistConfirmed: true,
  },

  {
    id: "apt_2",
    clinicId: "clinic_justvision",
    branchId: "branch_surulere",
    patientId: "patient_2",
    patientName: "Chinedu Okafor",
    phone: "+234 802 345 6789",
    reason: "Glaucoma review",
    date: "2026-05-14",
    time: "10:30 AM",
    status: "RECEPTION_CONFIRMED",
    patientConfirmed: false,
    receptionistConfirmed: true,
  },

  {
    id: "apt_3",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    patientId: "patient_3",
    patientName: "Mary Peters",
    phone: "+234 803 456 7890",
    reason: "Glasses pickup",
    date: "2026-05-14",
    time: "12:00 PM",
    status: "PENDING_RECEPTION_CONFIRMATION",
    patientConfirmed: false,
    receptionistConfirmed: false,
  },
];

/**
 * =========================================================
 * WHATSAPP ACCOUNTS
 * =========================================================
 */
export const whatsappAccounts: WhatsAppAccount[] = [
  {
    id: "wa_1",
    clinicId: "clinic_justvision",
    phoneNumber: "+234 800 000 0000",
    displayName: "Just Vision Eye Centre",
    provider: "meta_cloud_api",
    status: "CONNECTED",
  },
];

/**
 * =========================================================
 * WHATSAPP MESSAGES
 * =========================================================
 *
 * IMPORTANT:
 * WhatsAppMessage uses `createdAt`, not `time`.
 */
export const whatsappMessages: WhatsAppMessage[] = [
  {
    id: "msg_1",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    patientId: "patient_1",
    patientName: "Ada Johnson",
    direction: "incoming",
    text: "Good morning, I want to book an eye test.",
    createdAt: new Date("2026-05-14T08:12:00"),
    status: "received",
  },

  {
    id: "msg_2",
    clinicId: "clinic_justvision",
    branchId: "branch_surulere",
    patientId: "patient_2",
    patientName: "Chinedu Okafor",
    direction: "incoming",
    text: "Please remind me of my appointment time.",
    createdAt: new Date("2026-05-14T08:30:00"),
    status: "received",
  },

  {
    id: "msg_3",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    patientId: "patient_3",
    patientName: "Mary Peters",
    direction: "incoming",
    text: "Are my glasses ready?",
    createdAt: new Date("2026-05-14T08:45:00"),
    status: "received",
  },
];

/**
 * =========================================================
 * OPTICAL ORDERS
 * =========================================================
 */
export const opticalOrders: OpticalOrder[] = [
  {
    id: "opt_1",
    clinicId: "clinic_justvision",
    branchId: "branch_ikeja",
    patientId: "patient_3",
    patientName: "Mary Peters",
    lensType: "Blue cut single vision",
    status: "Ready",
  },

  {
    id: "opt_2",
    clinicId: "clinic_justvision",
    branchId: "branch_surulere",
    patientId: "patient_2",
    patientName: "Chinedu Okafor",
    lensType: "Progressive lens",
    status: "Processing",
  },
];

/**
 * =========================================================
 * MEDICATION REMINDERS
 * =========================================================
 */
export const medicationReminders: MedicationReminder[] = [
  {
    id: "med_1",
    clinicId: "clinic_justvision",
    branchId: "branch_surulere",
    patientId: "patient_2",
    patientName: "Chinedu Okafor",
    medicationName: "Timolol eye drop",
    dosageInstruction: "Use 1 drop in both eyes twice daily.",
    frequency: "Twice daily",
    startDate: "2026-05-20",
    endDate: "2026-06-20",
    reminderTime: "8:00 AM",
    status: "SCHEDULED",
  },
];

/**
 * =========================================================
 * FOLLOW-UP REMINDERS
 * =========================================================
 */
export const followUpReminders: FollowUpReminder[] = [
  {
    id: "follow_rem_1",
    clinicId: "clinic_justvision",
    branchId: "branch_surulere",
    patientId: "patient_2",
    patientName: "Chinedu Okafor",
    followUpDate: "2026-06-20",
    followUpTime: "10:00 AM",
    reason: "Glaucoma follow-up review",
    reminderSchedule: [
      "2 days before",
      "12 hours before",
    ],
    status: "SCHEDULED",
  },
];

/**
 * =========================================================
 * AGENT QUEUE
 * =========================================================
 */
export const agentQueue: AgentQueueItem[] = [
  {
    id: "queue_1",
    clinicId: "clinic_justvision",
    patientName: "Unknown WhatsApp Patient",
    phone: "+234 809 000 0000",
    message: "Please I need help",
    intent: "unknown",
    priority: "normal",
    status: "waiting",
    createdAt: "Now",
  },
];

/**
 * =========================================================
 * AUTOMATION WORKFLOWS
 * =========================================================
 */
export const automationWorkflows: AutomationWorkflow[] = [
  {
    id: "workflow_1",
    clinicId: "clinic_justvision",
    name: "Appointment Request",
    trigger: "appointment_requested",
    channel: "whatsapp",
    enabled: true,
    template:
      "Hello {{patientName}}, please fill this appointment form: Full name, phone number, branch, preferred date, preferred time and reason for visit.",
  },

  {
    id: "workflow_2",
    clinicId: "clinic_justvision",
    name: "Appointment Reminder",
    trigger: "appointment_reminder",
    channel: "whatsapp",
    enabled: true,
    template:
      "Hello {{patientName}}, this is a reminder for your appointment at {{clinicName}} by {{time}}.",
  },

  {
    id: "workflow_3",
    clinicId: "clinic_justvision",
    name: "Medication Reminder",
    trigger: "medication_reminder",
    channel: "whatsapp",
    enabled: true,
    template:
      "Hello {{patientName}}, please remember your medication: {{dosageInstruction}}",
  },

  {
    id: "workflow_4",
    clinicId: "clinic_justvision",
    name: "Glasses Ready Alert",
    trigger: "optical_ready",
    channel: "whatsapp",
    enabled: true,
    template:
      "Hello {{patientName}}, your prescribed glasses are ready for pickup at {{branchName}}.",
  },

  {
    id: "workflow_5",
    clinicId: "clinic_justvision",
    name: "Missed Appointment Reschedule",
    trigger: "appointment_missed",
    channel: "whatsapp",
    enabled: true,
    template:
      "Hello {{patientName}}, you missed your appointment. Reply YES if you would like to reschedule.",
  },

  {
    id: "workflow_6",
    clinicId: "clinic_justvision",
    name: "Unknown Message Queue",
    trigger: "unknown_message",
    channel: "whatsapp",
    enabled: true,
    template:
      "Sorry, I could not understand your request clearly. A staff member will reply shortly. You have been added to the response queue.",
  },
];