import {
  CheckCircle2,
  Clock,
  MessageCircle,
  XCircle,
} from "lucide-react";

interface WorkflowExecutionCardProps {
  execution: {
    id: string;
    workflowName: string;
    patientName: string;
    action: string;
    status: string;
    message: string;
    time: string;
  };
}

export default function WorkflowExecutionCard({
  execution,
}: WorkflowExecutionCardProps) {
  const isSuccess = execution.status === "success";
  const isPending = execution.status === "pending";

  return (
    <div className="card card-padding">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
            <MessageCircle size={22} />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              {execution.workflowName}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Patient: {execution.patientName}
            </p>
          </div>
        </div>

        <span
          className={
            isSuccess
              ? "badge-success"
              : isPending
              ? "badge-warning"
              : "badge-danger"
          }
        >
          {execution.status}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          {execution.message}
        </p>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {execution.time}
          </span>

          <span>
            Action: {execution.action.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm font-medium">
        {isSuccess ? (
          <>
            <CheckCircle2
              size={17}
              className="text-green-600"
            />

            <span className="text-green-700">
              Workflow completed
            </span>
          </>
        ) : isPending ? (
          <>
            <Clock
              size={17}
              className="text-yellow-600"
            />

            <span className="text-yellow-700">
              Workflow pending
            </span>
          </>
        ) : (
          <>
            <XCircle
              size={17}
              className="text-red-600"
            />

            <span className="text-red-700">
              Workflow failed
            </span>
          </>
        )}
      </div>
    </div>
  );
}