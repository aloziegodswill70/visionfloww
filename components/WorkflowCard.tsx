import { AutomationWorkflow } from "@/lib/types";
import { Bot, Power, MessageCircle } from "lucide-react";

interface WorkflowCardProps {
  workflow: AutomationWorkflow;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  return (
    <div className="card card-padding">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
            <Bot size={22} />
          </div>

          <div>
            <h3 className="font-bold text-slate-950">
              {workflow.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Trigger: {workflow.trigger.replaceAll("_", " ")}
            </p>
          </div>
        </div>

        <span
          className={
            workflow.enabled
              ? "badge-success"
              : "badge-danger"
          }
        >
          {workflow.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MessageCircle size={16} />
          WhatsApp Template
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          {workflow.template}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button className="btn-primary flex-1">
          Edit Workflow
        </button>

        <button className="btn-soft flex-1 gap-2">
          <Power size={16} />
          {workflow.enabled ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
}