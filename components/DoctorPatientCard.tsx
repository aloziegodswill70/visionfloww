import { Clock, UserRoundCheck } from "lucide-react";
import { Appointment } from "@/lib/types";
import { getBranchById } from "@/lib/queries";

interface DoctorPatientCardProps {
  appointment: Appointment;
  isActive: boolean;
  onSelect: () => void;
}

export default function DoctorPatientCard({
  appointment,
  isActive,
  onSelect,
}: DoctorPatientCardProps) {
  const branch = getBranchById(appointment.branchId);

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        isActive
          ? "border-clinic-blue bg-sky-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">
            {appointment.patientName}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {branch?.name ?? "Clinic branch"}
          </p>
        </div>

        <span className="badge-info capitalize">
          {appointment.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Clock size={15} />
        <span>
          {appointment.reason} • {appointment.time}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-sky-700">
        <UserRoundCheck size={14} />
        Doctor workflow
      </div>
    </button>
  );
}