"use client";

import { Glasses, Send, CheckCircle2, Clock } from "lucide-react";
import { OpticalOrder } from "@/lib/types";
import { getBranchById } from "@/lib/queries";
import { useClinicStore } from "@/lib/store/clinic-store";

interface OpticalOrderCardProps {
  order: OpticalOrder;
}

export default function OpticalOrderCard({
  order,
}: OpticalOrderCardProps) {
  const branch = getBranchById(order.branchId);

  const markOpticalReady = useClinicStore(
    (state) => state.markOpticalReady
  );

  const markOpticalDelivered = useClinicStore(
    (state) => state.markOpticalDelivered
  );

  const addExecutionLog = useClinicStore(
    (state) => state.addExecutionLog
  );

  const isReady = order.status === "Ready";
  const isDelivered = order.status === "Delivered";

  function handleSendPickupReminder() {
    addExecutionLog({
      id: `exec_${Date.now()}`,
      clinicId: order.clinicId,
      workflowName: "Optical Pickup Reminder",
      patientName: order.patientName,
      action: "send_whatsapp",
      status: "success",
      message: `Pickup reminder sent for ${order.lensType}.`,
      time: "Now",
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
            <Glasses size={22} />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              {order.patientName}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {branch?.name ?? "Clinic branch"}
            </p>
          </div>
        </div>

        <span
          className={
            isDelivered
              ? "badge-success"
              : isReady
              ? "badge-info"
              : "badge-warning"
          }
        >
          {order.status}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          Lens / Order Type
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {order.lensType}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {!isReady && !isDelivered && (
          <button
            onClick={() => markOpticalReady(order.id)}
            className="btn-primary gap-2"
          >
            <CheckCircle2 size={16} />
            Mark Ready
          </button>
        )}

        {isReady && (
          <button
            onClick={handleSendPickupReminder}
            className="btn-whatsapp gap-2"
          >
            <Send size={16} />
            Send Pickup Reminder
          </button>
        )}

        {isReady && (
          <button
            onClick={() => markOpticalDelivered(order.id)}
            className="btn-primary gap-2"
          >
            <CheckCircle2 size={16} />
            Mark Delivered
          </button>
        )}

        {isDelivered && (
          <div className="flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 size={16} />
            Delivered to patient
          </div>
        )}

        {!isDelivered && (
          <button
            onClick={handleSendPickupReminder}
            className="btn-soft gap-2"
          >
            <Clock size={16} />
            Schedule Reminder
          </button>
        )}
      </div>
    </div>
  );
}