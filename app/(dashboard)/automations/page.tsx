import PageShell from "@/components/PageShell";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import WorkflowCard from "@/components/WorkflowCard";
import { getClinicAutomationWorkflows } from "@/lib/queries";

export default function AutomationsPage() {
  const workflows = getClinicAutomationWorkflows();

  return (
    <PageShell
      title="Automation Orchestration"
      subtitle="Manage tenant-specific WhatsApp workflows, triggers and message templates."
    >
      <WorkflowBuilder />

      <div className="grid gap-5 xl:grid-cols-3">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
          />
        ))}
      </div>
    </PageShell>
  );
}