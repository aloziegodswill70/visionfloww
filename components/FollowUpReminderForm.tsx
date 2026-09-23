"use client";

import { CalendarClock } from "lucide-react";

export interface FollowUpFormData {
  enabled: boolean;
  followUpDate: string;
  followUpTime: string;
  reminderSchedule: string;
  reason: string;
  note: string;
}

interface FollowUpReminderFormProps {
  value: FollowUpFormData;
  onChange: (value: FollowUpFormData) => void;
}

export default function FollowUpReminderForm({
  value,
  onChange,
}: FollowUpReminderFormProps) {
  function updateField(
    field: keyof FollowUpFormData,
    fieldValue: string | boolean
  ) {
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
            <CalendarClock size={21} />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              Follow-Up Appointment
            </h3>

            <p className="text-sm text-slate-500">
              Set review date and automatic WhatsApp reminders.
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
          type="date"
          className="input-field"
          value={value.followUpDate}
          onChange={(event) =>
            updateField("followUpDate", event.target.value)
          }
        />

        <input
          type="time"
          className="input-field"
          value={value.followUpTime}
          onChange={(event) =>
            updateField("followUpTime", event.target.value)
          }
        />

        <select
          className="input-field"
          value={value.reminderSchedule}
          onChange={(event) =>
            updateField("reminderSchedule", event.target.value)
          }
        >
          <option value="">Reminder schedule</option>

          <option value="2 days before and 12 hours before">
            2 days before and 12 hours before
          </option>

          <option value="1 day before and 3 hours before">
            1 day before and 3 hours before
          </option>

          <option value="1 week before and 1 day before">
            1 week before and 1 day before
          </option>
        </select>

        <select
          className="input-field"
          value={value.reason}
          onChange={(event) =>
            updateField("reason", event.target.value)
          }
        >
          <option value="">Reason for follow-up</option>

          <option value="Glaucoma review">
            Glaucoma review
          </option>

          <option value="Dry eye review">
            Dry eye review
          </option>

          <option value="Post-op review">
            Post-op review
          </option>

          <option value="Contact lens review">
            Contact lens review
          </option>

          <option value="Routine review">
            Routine review
          </option>
        </select>

        <textarea
          className="input-field min-h-24 md:col-span-2"
          placeholder="Extra note for patient"
          value={value.note}
          onChange={(event) =>
            updateField("note", event.target.value)
          }
        />
      </div>
    </div>
  );
}