"use client";

import { Activity, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useClinicStore } from "@/lib/store/clinic-store";

export default function ExecutionStatCards() {
  const executionLogs = useClinicStore((state) => state.executionLogs);

  const success = executionLogs.filter((log) => log.status === "success");
  const pending = executionLogs.filter((log) => log.status === "pending");
  const failed = executionLogs.filter((log) => log.status === "failed");

  return (
    <div className="grid gap-5 md:grid-cols-4">
      <div className="card card-padding">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total Logs</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">
              {executionLogs.length}
            </h3>
          </div>

          <Activity className="text-clinic-blue" size={26} />
        </div>
      </div>

      <div className="card card-padding">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Successful</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">
              {success.length}
            </h3>
          </div>

          <CheckCircle2 className="text-green-600" size={26} />
        </div>
      </div>

      <div className="card card-padding">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Pending</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">
              {pending.length}
            </h3>
          </div>

          <Clock className="text-yellow-600" size={26} />
        </div>
      </div>

      <div className="card card-padding">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Failed</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-950">
              {failed.length}
            </h3>
          </div>

          <XCircle className="text-red-600" size={26} />
        </div>
      </div>
    </div>
  );
}