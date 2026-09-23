import { currentClinicId } from "@/lib/data";
import { detectIntent } from "./intent-detector";
import { closedMessage, isClinicOpen } from "./working-hours";

export function orchestrateIncomingMessage(message: string) {
  const intent = detectIntent(message);
  const clinicOpen = isClinicOpen();

  if (!clinicOpen && intent !== "unknown") {
    return {
      clinicId: currentClinicId,
      intent,
      reply: closedMessage(),
      queueForAgent: true,
    };
  }

  if (intent === "book_appointment") {
    return {
      clinicId: currentClinicId,
      intent,
      reply:
        "Sure. Please fill this appointment form:\n\nFull name:\nPhone number:\nPreferred branch:\nPreferred date:\nPreferred time:\nReason for visit:\n\nA receptionist will confirm availability before your appointment is sealed.",
      queueForAgent: true,
    };
  }

  if (intent === "confirm_appointment") {
    return {
      clinicId: currentClinicId,
      intent,
      reply:
        "Thank you. Your confirmation has been received. Your appointment slot is now reserved. Please arrive at least 10 minutes early.",
      queueForAgent: false,
    };
  }

  if (intent === "reschedule_appointment") {
    return {
      clinicId: currentClinicId,
      intent,
      reply:
        "No problem. Please send your full name, previous appointment date, and your new preferred date/time. A receptionist will confirm the new slot.",
      queueForAgent: true,
    };
  }

  if (intent === "ask_glasses_status") {
    return {
      clinicId: currentClinicId,
      intent,
      reply:
        "Please send the name used for your glasses order. Our optical team will confirm the status and notify you once it is ready for pickup.",
      queueForAgent: true,
    };
  }

  if (intent === "medication_question") {
    return {
      clinicId: currentClinicId,
      intent,
      reply:
        "Please follow the dosage given by your doctor. If you are unsure, send the medication name and your full name. A staff member will confirm shortly.",
      queueForAgent: true,
    };
  }

  if (intent === "request_directions") {
    return {
      clinicId: currentClinicId,
      intent,
      reply:
        "Please tell us the branch you want to visit, and we will send the correct address and direction details.",
      queueForAgent: false,
    };
  }

  if (intent === "speak_to_staff") {
    return {
      clinicId: currentClinicId,
      intent,
      reply:
        "A staff member will attend to you shortly. You have been added to the response queue.",
      queueForAgent: true,
    };
  }

  return {
    clinicId: currentClinicId,
    intent,
    reply:
      "Sorry, I could not understand your request clearly. A staff member will reply shortly. You have been added to the response queue.",
    queueForAgent: true,
  };
}