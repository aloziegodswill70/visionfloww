"use client";

import OpticalOrderCard from "@/components/OpticalOrderCard";
import OpticalReminderForm from "@/components/OpticalReminderForm";
import { useClinicStore } from "@/lib/store/clinic-store";

export default function OpticalQueuePanel() {
  const orders = useClinicStore((state) => state.opticalOrders);

  const processing = orders.filter(
    (order) => order.status === "Processing"
  );

  const ready = orders.filter(
    (order) => order.status === "Ready"
  );

  const delivered = orders.filter(
    (order) => order.status === "Delivered"
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Processing
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {processing.length}
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Ready for Pickup
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {ready.length}
          </h3>
        </div>

        <div className="card card-padding">
          <p className="text-sm text-slate-500">
            Delivered
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-950">
            {delivered.length}
          </h3>
        </div>
      </div>

      <OpticalReminderForm />

      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-950">
            Optical Orders
          </h3>

          <p className="text-sm text-slate-500">
            Track glasses production, pickup reminders and delivery status.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {orders.map((order) => (
            <OpticalOrderCard
              key={order.id}
              order={order}
            />
          ))}
        </div>
      </div>
    </div>
  );
}