import { automationWorkflows, branches, clinics } from "@/lib/data";
import { renderTemplate } from "./template-engine";

import { sendWhatsAppMessage } from "./actions/send-whatsapp";
import { notifyStaff } from "./actions/notify-staff";
import { createFollowUpTask } from "./actions/create-follow-up";

interface RunWorkflowInput {
  clinicId: string;
  workflowName: string;
  patientName: string;
  branchId?: string;
  time?: string;
  phoneNumber?: string;
}

export function runWorkflow(input: RunWorkflowInput) {
  const clinic = clinics.find(
    (item) => item.id === input.clinicId
  );

  const workflow = automationWorkflows.find(
    (item) =>
      item.clinicId === input.clinicId &&
      item.name === input.workflowName &&
      item.enabled
  );

  if (!workflow || !clinic) {
    return {
      success: false,
      action: "none",
      message: "Workflow not found or disabled.",
      staffNotification: "No workflow action was executed.",
    };
  }

  const branch = input.branchId
    ? branches.find(
        (item) =>
          item.id === input.branchId &&
          item.clinicId === input.clinicId
      )
    : undefined;

  const message = renderTemplate(workflow.template, {
    patientName: input.patientName,
    clinicName: clinic.name,
    branchName: branch?.name ?? "our clinic",
    time: input.time ?? "your scheduled time",
    reviewLink: "https://g.page/r/example-review-link",
  });

  const whatsappResult = sendWhatsAppMessage({
    to: input.phoneNumber ?? "No phone number",
    message,
  });

  const staffNotification = notifyStaff({
    clinicId: input.clinicId,
    message: `${workflow.name} workflow executed for ${input.patientName}.`,
  });

  const followUpTask = createFollowUpTask({
    clinicId: input.clinicId,
    patientName: input.patientName,
    note: `${workflow.name} follow-up created.`,
  });

  return {
    success: true,
    action: "send_whatsapp",
    message,
    workflow,
    whatsappResult,
    staffNotification,
    followUpTask,
  };
}