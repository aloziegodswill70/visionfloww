export function sendWhatsAppMessage({
  to,
  message,
}: {
  to: string;
  message: string;
}) {
  return {
    success: true,
    provider: "mock_whatsapp",
    to,
    message,
    status: "queued",
  };
}