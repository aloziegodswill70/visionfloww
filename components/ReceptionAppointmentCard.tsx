"use client";

import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserRoundCheck,
} from "lucide-react";
import { Appointment } from "@/lib/types";
import { getBranchById } from "@/lib/queries";
import { useClinicStore } from "@/lib/store/clinic-store";

interface ReceptionAppointmentCardProps {
  appointment: Appointment;
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function ReceptionAppointmentCard({
  appointment,
}: ReceptionAppointmentCardProps) {
  const branch = getBranchById(appointment.branchId);

  const confirmAppointment = useClinicStore(
    (state) => state.confirmAppointment
  );

  const markPatientArrived = useClinicStore(
    (state) => state.markPatientArrived
  );

  const queueForDoctor = useClinicStore(
    (state) => state.queueForDoctor
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-950">
            {appointment.patientName}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {appointment.phone}
          </p>
        </div>

        <span className="badge-info capitalize">
          {formatStatus(appointment.status)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong>Branch:</strong>{" "}
          {branch?.name ?? "Clinic branch"}
        </p>

        <p>
          <strong>Reason:</strong> {appointment.reason}
        </p>

        <p className="flex items-center gap-2">
          <Clock size={15} />
          {appointment.date} • {appointment.time}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span
          className={
            appointment.receptionistConfirmed
              ? "badge-success"
              : "badge-warning"
          }
        >
          Reception:{" "}
          {appointment.receptionistConfirmed
            ? "Confirmed"
            : "Pending"}
        </span>

        <span
          className={
            appointment.patientConfirmed
              ? "badge-success"
              : "badge-warning"
          }
        >
          Patient:{" "}
          {appointment.patientConfirmed
            ? "Confirmed"
            : "Awaiting YES"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {appointment.status === "PENDING_RECEPTION_CONFIRMATION" && (
          <button
            onClick={() => confirmAppointment(appointment.id)}
            className="btn-primary gap-2"
          >
            <CalendarCheck size={16} />
            Confirm Slot
          </button>
        )}

        {appointment.status === "RECEPTION_CONFIRMED" && (
          <button className="btn-whatsapp gap-2">
            <CheckCircle2 size={16} />
            Send YES Reminder
          </button>
        )}

        {appointment.status === "PATIENT_CONFIRMED" && (
          <button
            onClick={() => markPatientArrived(appointment.id)}
            className="btn-primary gap-2"
          >
            <UserRoundCheck size={16} />
            Mark Arrived
          </button>
        )}

        {appointment.status === "CHECKED_IN" && (
          <button
            onClick={() => queueForDoctor(appointment.id)}
            className="btn-primary gap-2"
          >
            <UserRoundCheck size={16} />
            Queue for Doctor
          </button>
        )}

        {appointment.status === "MISSED" && (
          <button className="btn-soft gap-2">
            <AlertCircle size={16} />
            Reschedule
          </button>
        )}

        <button className="btn-soft">
          View Details
        </button>
      </div>
    </div>
  );
}