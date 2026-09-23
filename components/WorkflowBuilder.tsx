"use client";

import { useState } from "react";
import { Plus, Workflow } from "lucide-react";

export default function WorkflowBuilder() {
  const [open, setOpen] = useState(false);

  return (
    <div className="card card-padding mb-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
            <Workflow size={23} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-950">
              Workflow Builder
            </h3>

            <p className="text-sm text-slate-500">
              Create clinic-specific WhatsApp automations for reminders, follow-ups and optical alerts.
            </p>
          </div>
        </div>

        <button onClick={() => setOpen(!open)} className="btn-primary gap-2">
          <Plus size={16} />
          New Workflow
        </button>
      </div>

      {open && (
        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-2">
          <input
            className="input-field"
            placeholder="Workflow name e.g. Post Consultation Follow-up"
          />

          <select className="input-field">
            <option>Select trigger</option>
            <option>Appointment Created</option>
            <option>Appointment Reminder</option>
            <option>Optical Ready</option>
            <option>Visit Completed</option>
            <option>Follow-up Due</option>
            <option>New WhatsApp Message</option>
          </select>

          <select className="input-field">
            <option>Select branch scope</option>
            <option>All branches</option>
            <option>Ikeja Branch</option>
            <option>Surulere Branch</option>
          </select>

          <select className="input-field">
            <option>Action channel</option>
            <option>WhatsApp</option>
          </select>

          <textarea
            className="input-field min-h-28 lg:col-span-2"
            placeholder="Message template e.g. Hello {{patientName}}, this is a reminder for your appointment at {{clinicName}}."
          />

          <div className="flex justify-end gap-3 lg:col-span-2">
            <button onClick={() => setOpen(false)} className="btn-soft">
              Cancel
            </button>

            <button onClick={() => setOpen(false)} className="btn-whatsapp">
              Save Workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}