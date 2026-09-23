"use client";

import {
  Activity,
  CheckCircle2,
  Clock,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { useClinicStore } from "@/lib/store/clinic-store";

function getStatusIcon(status: string) {
  if (status === "success") return CheckCircle2;
  if (status === "pending") return Clock;
  if (status === "failed") return XCircle;
  return Activity;
}

function getStatusClass(status: string) {
  if (status === "success") return "text-green-600 bg-green-100";
  if (status === "pending") return "text-yellow-600 bg-yellow-100";
  if (status === "failed") return "text-red-600 bg-red-100";
  return "text-slate-600 bg-slate-100";
}

export default function ExecutionTimeline() {
  const executionLogs = useClinicStore((state) => state.executionLogs);

  return (
    <div className="card card-padding">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-950">
          Live Execution Timeline
        </h3>

        <p className="text-sm text-slate-500">
          Real-time audit trail of workflow actions and automation events.
        </p>
      </div>

      {executionLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
            <MessageCircle size={25} />
          </div>

          <h4 className="font-bold text-slate-950">
            No live execution logs yet
          </h4>

          <p className="mt-1 text-sm text-slate-500">
            Try marking an optical order ready or sending a pickup reminder.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {executionLogs.map((log) => {
            const Icon = getStatusIcon(log.status);

            return (
              <div
                key={log.id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getStatusClass(
                    log.status
                  )}`}
                >
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                    <div>
                      <h4 className="font-bold text-slate-950">
                        {log.workflowName}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Patient: {log.patientName}
                      </p>
                    </div>

                    <span className="text-xs text-slate-400">
                      {log.time}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {log.message}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge-info">
                      {log.action.replaceAll("_", " ")}
                    </span>

                    <span
                      className={
                        log.status === "success"
                          ? "badge-success"
                          : log.status === "pending"
                          ? "badge-warning"
                          : "badge-danger"
                      }
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}