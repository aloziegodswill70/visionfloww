"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function NewAppointmentModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        New Appointment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Book Appointment
                </h3>
                <p className="text-sm text-slate-500">
                  Capture patient details from WhatsApp or front desk.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input className="input-field" placeholder="Patient full name" />
              <input className="input-field" placeholder="Phone number" />

              <select className="input-field">
                <option>Select branch</option>
                <option>Ikeja Branch</option>
                <option>Surulere Branch</option>
              </select>

              <input className="input-field" type="date" />
              <input className="input-field" type="time" />

              <select className="input-field">
                <option>Reason for visit</option>
                <option>Routine eye test</option>
                <option>Glaucoma review</option>
                <option>Cataract consultation</option>
                <option>Glasses pickup</option>
                <option>Emergency complaint</option>
              </select>

              <textarea
                className="input-field min-h-24"
                placeholder="Additional note"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="btn-soft">
                Cancel
              </button>

              <button onClick={() => setOpen(false)} className="btn-whatsapp">
                Save & Send WhatsApp Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}