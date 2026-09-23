// components/WorkflowExecutionPanel.tsx

import WorkflowExecutionCard from "@/components/WorkflowExecutionCard";
import { workflowExecutions } from "@/lib/execution-data";

export default function WorkflowExecutionPanel() {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {workflowExecutions.map((execution) => (
        <WorkflowExecutionCard
          key={execution.id}
          execution={execution}
        />
      ))}
    </div>
  );
}