import PageShell from "@/components/PageShell";
import ExecutionStatCards from "@/components/ExecutionStatCards";
import ExecutionTimeline from "@/components/ExecutionTimeline";

export default function ExecutionsPage() {
  return (
    <PageShell
      title="Workflow Executions"
      subtitle="Live audit trail for WhatsApp automations, reminders and workflow actions."
    >
      <div className="space-y-6">
        <ExecutionStatCards />
        <ExecutionTimeline />
      </div>
    </PageShell>
  );
}