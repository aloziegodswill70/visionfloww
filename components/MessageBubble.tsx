import { WhatsAppMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

function formatMessageTime(createdAt?: Date) {
  if (!createdAt) {
    return "";
  }

  return createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isOutgoing
            ? "bg-clinic-whatsapp text-white"
            : "bg-white border border-slate-200 text-slate-700"
        }`}
      >
        <p>{message.text}</p>

        <p
          className={`mt-2 text-[11px] ${
            isOutgoing ? "text-white/80" : "text-slate-400"
          }`}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}