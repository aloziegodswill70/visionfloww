"use client";

import { Bell, CalendarClock, Glasses, Pill } from "lucide-react";
import { useClinicStore } from "@/lib/store/clinic-store";
import { ScheduledReminder } from "@/lib/scheduler/reminder-rules";

function getReminderIcon(type: ScheduledReminder["type"]) {
  if (type === "medication") return Pill;
  if (type === "follow_up") return CalendarClock;
  if (type === "optical_pickup") return Glasses;
  return Bell;
}

function getStatusBadge(status: string) {
  if (status === "scheduled") return "badge-info";
  if (status === "sent") return "badge-success";
  if (status === "failed") return "badge-danger";
  return "badge-warning";
}

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

export default function ReminderSchedulerPanel() {
  const appointments = useClinicStore((state) => state.appointments);

  const medicationReminders = useClinicStore(
    (state) => state.medicationReminders
  );

  const followUpReminders = useClinicStore(
    (state) => state.followUpReminders
  );

  const opticalOrders = useClinicStore((state) => state.opticalOrders);

  const reminders: ScheduledReminder[] = [
    ...appointments
      .filter(
        (appointment) => appointment.status === "PATIENT_CONFIRMED"
      )
      .map((appointment) => ({
        id: `appointment_${appointment.id}`,
        clinicId: appointment.clinicId,
        patientName: appointment.patientName,
        type: "appointment" as const,
        channel: "whatsapp" as const,
        title: "Appointment Reminder",
        message: `Hello ${appointment.patientName}, this is a reminder for your appointment on ${appointment.date} by ${appointment.time}.`,
        scheduledFor: "2 days before and 12 hours before",
        status: "scheduled" as const,
      })),

    ...followUpReminders.map((reminder) => ({
      id: `followup_${reminder.id}`,
      clinicId: reminder.clinicId,
      patientName: reminder.patientName,
      type: "follow_up" as const,
      channel: "whatsapp" as const,
      title: "Follow-Up Reminder",
      message: `Hello ${reminder.patientName}, this is a reminder for your follow-up appointment on ${reminder.followUpDate} by ${reminder.followUpTime}.`,
      scheduledFor: reminder.reminderSchedule.join(", "),
      status: normalizeReminderStatus(reminder.status),
    })),

    ...medicationReminders.map((reminder) => ({
      id: `medication_${reminder.id}`,
      clinicId: reminder.clinicId,
      patientName: reminder.patientName,
      type: "medication" as const,
      channel: "whatsapp" as const,
      title: "Medication Reminder",
      message: `Hello ${reminder.patientName}, please remember: ${reminder.dosageInstruction}`,
      scheduledFor: `${reminder.frequency} at ${reminder.reminderTime}`,
      status: normalizeReminderStatus(reminder.status),
    })),

    ...opticalOrders
      .filter((order) => order.status === "Ready")
      .map((order) => ({
        id: `optical_${order.id}`,
        clinicId: order.clinicId,
        patientName: order.patientName,
        type: "optical_pickup" as const,
        channel: "whatsapp" as const,
        title: "Optical Pickup Reminder",
        message: `Hello ${order.patientName}, your prescribed glasses are ready for pickup.`,
        scheduledFor: "Immediately, then every 3 days until pickup",
        status: "scheduled" as const,
      })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Total Reminders
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {reminders.length}
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Medication
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {
              reminders.filter(
                (reminder) => reminder.type === "medication"
              ).length
            }
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Follow-Ups
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {
              reminders.filter(
                (reminder) => reminder.type === "follow_up"
              ).length
            }
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Optical Pickup
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {
              reminders.filter(
                (reminder) => reminder.type === "optical_pickup"
              ).length
            }
          </h3>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {reminders.map((reminder) => {
          const Icon = getReminderIcon(reminder.type);

          return (
            <div
              key={reminder.id}
              className="card card-padding"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      {reminder.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {reminder.patientName}
                    </p>
                  </div>
                </div>

                <span className={getStatusBadge(reminder.status)}>
                  {reminder.status}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  {reminder.message}
                </p>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                <strong className="text-slate-700">
                  Schedule:
                </strong>{" "}
                {reminder.scheduledFor}
              </div>

              <button className="btn-whatsapp mt-5 w-full">
                Send Test Reminder
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}