import { MessageCircle, Send } from "lucide-react";

interface DashboardWhatsAppMessage {
  id: string;
  patientName: string | null;
  phone: string | null;
  text: string;
  createdAt: Date;
}

interface WhatsAppInboxProps {
  messages: DashboardWhatsAppMessage[];
}

function formatMessageTime(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function WhatsAppInbox({
  messages,
}: WhatsAppInboxProps) {
  return (
    <div className="card card-padding">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-11 w-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
          <MessageCircle size={22} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-950">
            WhatsApp Inbox
          </h3>

          <p className="text-sm text-slate-500">
            Recent patient messages.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="font-semibold text-slate-700">
              No WhatsApp messages yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Patient messages will appear here when WhatsApp is connected.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-900">
                  {message.patientName ||
                    message.phone ||
                    "WhatsApp Patient"}
                </h4>

                <span className="text-xs text-slate-400">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-2">
                {message.text}
              </p>

              <button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-clinic-blue">
                <Send size={15} />
                Reply
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}