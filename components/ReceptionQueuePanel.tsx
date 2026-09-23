"use client";

import { useClinicStore } from "@/lib/store/clinic-store";
import { getClinicAgentQueue } from "@/lib/queries";
import ReceptionAppointmentCard from "@/components/ReceptionAppointmentCard";
import { MessageCircleWarning } from "lucide-react";

export default function ReceptionQueuePanel() {
  const allAppointments = useClinicStore((state) => state.appointments);
  const agentQueue = getClinicAgentQueue();

  const pendingAppointments = allAppointments.filter(
    (appointment) =>
      appointment.status === "PENDING_RECEPTION_CONFIRMATION" ||
      appointment.status === "RECEPTION_CONFIRMED"
  );

  const confirmedAppointments = allAppointments.filter(
    (appointment) => appointment.status === "PATIENT_CONFIRMED"
  );

  const arrivedAppointments = allAppointments.filter(
    (appointment) => appointment.status === "CHECKED_IN"
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-4">
        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Pending Requests
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {pendingAppointments.length}
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Confirmed Today
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {confirmedAppointments.length}
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Arrived Patients
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {arrivedAppointments.length}
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Agent Queue
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {agentQueue.length}
          </h3>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-950">
              Appointment Control
            </h3>

            <p className="text-sm text-slate-500">
              Confirm slots, track patient agreement and queue arrivals.
            </p>
          </div>

          <div className="grid gap-4">
            {allAppointments.map((appointment) => (
              <ReceptionAppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-950">
              Agent Queue
            </h3>

            <p className="text-sm text-slate-500">
              Unknown or abstract messages waiting for staff.
            </p>
          </div>

          <div className="space-y-4">
            {agentQueue.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                    <MessageCircleWarning size={20} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-950">
                      {item.patientName ?? "Unknown Patient"}
                    </h4>

                    <p className="text-xs text-slate-500">
                      {item.phone ?? "No phone"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  {item.message}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge-warning">
                    {item.intent}
                  </span>

                  <span className="badge-info">
                    {item.status}
                  </span>
                </div>

                <button className="btn-primary mt-4 w-full">
                  Assign to Receptionist
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}