export type PatientIntent =
  | "book_appointment"
  | "confirm_appointment"
  | "reschedule_appointment"
  | "ask_glasses_status"
  | "request_directions"
  | "medication_question"
  | "missed_appointment"
  | "speak_to_staff"
  | "unknown";

export function detectIntent(message: string): PatientIntent {
  const text = message.toLowerCase();

  if (
    text.includes("book") ||
    text.includes("appointment") ||
    text.includes("eye test") ||
    text.includes("see doctor") ||
    text.includes("consultation")
  ) {
    return "book_appointment";
  }

  if (
    text === "yes" ||
    text.includes("i confirm") ||
    text.includes("confirmed") ||
    text.includes("i will come")
  ) {
    return "confirm_appointment";
  }

  if (
    text.includes("reschedule") ||
    text.includes("change my appointment") ||
    text.includes("another day") ||
    text.includes("missed my appointment")
  ) {
    return "reschedule_appointment";
  }

  if (
    text.includes("glasses") ||
    text.includes("lens") ||
    text.includes("ready") ||
    text.includes("pickup")
  ) {
    return "ask_glasses_status";
  }

  if (
    text.includes("drug") ||
    text.includes("eye drop") ||
    text.includes("eyedrop") ||
    text.includes("dosage") ||
    text.includes("medicine")
  ) {
    return "medication_question";
  }

  if (
    text.includes("direction") ||
    text.includes("address") ||
    text.includes("location")
  ) {
    return "request_directions";
  }

  if (
    text.includes("human") ||
    text.includes("staff") ||
    text.includes("agent") ||
    text.includes("reception") ||
    text.includes("doctor")
  ) {
    return "speak_to_staff";
  }

  return "unknown";
}