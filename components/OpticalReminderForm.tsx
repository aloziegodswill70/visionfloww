"use client";

import { Bell, Save } from "lucide-react";
import { useState } from "react";

export default function OpticalReminderForm() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="card card-padding">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
            <Bell size={22} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-950">
              Optical Pickup Reminder Rule
            </h3>

            <p className="text-sm text-slate-500">
              Automatically remind patients when glasses are ready and not yet picked up.
            </p>
          </div>
        </div>

        <button
          onClick={() => setEnabled(!enabled)}
          className={enabled ? "badge-success" : "badge-danger"}
        >
          {enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <select className="input-field">
          <option>When order is marked ready</option>
          <option>Immediately after ready</option>
          <option>1 hour after ready</option>
          <option>End of clinic day</option>
        </select>

        <select className="input-field">
          <option>Repeat reminder</option>
          <option>Every 3 days until pickup</option>
          <option>Every 7 days until pickup</option>
          <option>Only once</option>
        </select>

        <textarea
          className="input-field min-h-24 md:col-span-2"
          placeholder="Hello {{patientName}}, your prescribed glasses are ready for pickup at {{branchName}}."
        />
      </div>

      <button className="btn-primary mt-5 gap-2">
        <Save size={16} />
        Save Optical Reminder Rule
      </button>
    </div>
  );
}