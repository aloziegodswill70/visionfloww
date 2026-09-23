"use client";

import {
  Clock,
  CheckCircle2,
  AlertCircle,
  UserRoundCheck,
} from "lucide-react";

interface AppointmentBranch {
  id: string;
  name: string;
}

interface DashboardAppointment {
  id: string;
  patientName: string;
  reason: string;
  time: string;
  status: string;
  patientConfirmed: boolean;
  receptionistConfirmed: boolean;
  branch: AppointmentBranch;
}

interface AppointmentQueueProps {
  appointments: DashboardAppointment[];
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusBadge(status: string) {
  if (
    status === "PATIENT_CONFIRMED" ||
    status === "CHECKED_IN" ||
    status === "IN_CONSULTATION" ||
    status === "COMPLETED"
  ) {
    return "badge-success w-fit capitalize";
  }

  if (
    status === "PENDING_RECEPTION_CONFIRMATION" ||
    status === "RECEPTION_CONFIRMED" ||
    status === "RESCHEDULED"
  ) {
    return "badge-warning w-fit capitalize";
  }

  return "badge-danger w-fit capitalize";
}

export default function AppointmentQueue({
  appointments,
}: AppointmentQueueProps) {
  return (
    <div className="card card-padding">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950">
            Today’s Appointment Queue
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Patients booked through WhatsApp and front desk.
          </p>
        </div>

        <button className="btn-soft">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="font-semibold text-slate-700">
              No appointments yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              New patient appointments will appear here.
            </p>
          </div>
        ) : (
          appointments.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-slate-900">
                    {item.patientName}
                  </h4>

                  <span className="badge-info">
                    {item.branch?.name ?? "Clinic Branch"}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={15} />

                  <span>
                    {item.reason} • {item.time}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span
                    className={
                      item.receptionistConfirmed
                        ? "badge-success"
                        : "badge-warning"
                    }
                  >
                    Reception:{" "}
                    {item.receptionistConfirmed
                      ? "Confirmed"
                      : "Pending"}
                  </span>

                  <span
                    className={
                      item.patientConfirmed
                        ? "badge-success"
                        : "badge-warning"
                    }
                  >
                    Patient:{" "}
                    {item.patientConfirmed
                      ? "Confirmed"
                      : "Awaiting YES"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <span className={getStatusBadge(item.status)}>
                  {formatStatus(item.status)}
                </span>

                {item.status === "PATIENT_CONFIRMED" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <CheckCircle2 size={14} />
                    Slot reserved
                  </span>
                )}

                {item.status === "CHECKED_IN" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-sky-700">
                    <UserRoundCheck size={14} />
                    Doctor queue
                  </span>
                )}

                {item.status === "MISSED" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-700">
                    <AlertCircle size={14} />
                    Needs reschedule
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}