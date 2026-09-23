"use client";

import { Pill } from "lucide-react";

export interface MedicationFormData {
  enabled: boolean;
  medicationName: string;
  dosageInstruction: string;
  frequency: string;
  reminderTime: string;
  startDate: string;
  endDate: string;
  extraInstruction: string;
}

interface MedicationReminderFormProps {
  value: MedicationFormData;
  onChange: (value: MedicationFormData) => void;
}

export default function MedicationReminderForm({
  value,
  onChange,
}: MedicationReminderFormProps) {
  function updateField(field: keyof MedicationFormData, fieldValue: string | boolean) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-clinic-blue">
            <Pill size={21} />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              Medication Reminder
            </h3>

            <p className="text-sm text-slate-500">
              Set eyedrop dosage and WhatsApp reminder schedule.
            </p>
          </div>
        </div>

        <button
          onClick={() => updateField("enabled", !value.enabled)}
          className={value.enabled ? "badge-success" : "badge-danger"}
        >
          {value.enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="input-field"
          placeholder="Medication name e.g. Timolol"
          value={value.medicationName}
          onChange={(event) =>
            updateField("medicationName", event.target.value)
          }
        />

        <input
          className="input-field"
          placeholder="Dosage e.g. 1 drop both eyes"
          value={value.dosageInstruction}
          onChange={(event) =>
            updateField("dosageInstruction", event.target.value)
          }
        />

        <select
          className="input-field"
          value={value.frequency}
          onChange={(event) => updateField("frequency", event.target.value)}
        >
          <option value="">Frequency</option>
          <option value="Once daily">Once daily</option>
          <option value="Twice daily">Twice daily</option>
          <option value="Three times daily">Three times daily</option>
          <option value="Every 6 hours">Every 6 hours</option>
        </select>

        <input
          type="time"
          className="input-field"
          value={value.reminderTime}
          onChange={(event) => updateField("reminderTime", event.target.value)}
        />

        <input
          type="date"
          className="input-field"
          value={value.startDate}
          onChange={(event) => updateField("startDate", event.target.value)}
        />

        <input
          type="date"
          className="input-field"
          value={value.endDate}
          onChange={(event) => updateField("endDate", event.target.value)}
        />

        <textarea
          className="input-field min-h-24 md:col-span-2"
          placeholder="Instruction e.g. Wash your hands before use. Do not touch bottle tip to the eye."
          value={value.extraInstruction}
          onChange={(event) =>
            updateField("extraInstruction", event.target.value)
          }
        />
      </div>
    </div>
  );
}