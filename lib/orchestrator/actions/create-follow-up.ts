export function createFollowUpTask({
  clinicId,
  patientName,
  note,
}: {
  clinicId: string;
  patientName: string;
  note: string;
}) {
  return {
    success: true,
    clinicId,
    patientName,
    note,
    status: "pending",
  };
}