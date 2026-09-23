export function notifyStaff({
  clinicId,
  message,
}: {
  clinicId: string;
  message: string;
}) {
  return {
    success: true,
    clinicId,
    channel: "dashboard_notification",
    message,
    status: "created",
  };
}