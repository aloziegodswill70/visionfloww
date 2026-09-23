"use client";

import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { orchestrateIncomingMessage } from "@/lib/orchestrator";

export default function OrchestratorTestPanel() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    clinicId: string;
    intent: string;
    reply: string;
  } | null>(null);

  function handleTest() {
    if (!message.trim()) return;

    const response = orchestrateIncomingMessage(message);
    setResult(response);
  }

  return (
    <div className="card card-padding mt-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
          <Bot size={24} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-950">
            Orchestrator Test Panel
          </h3>
          <p className="text-sm text-slate-500">
            Test how the WhatsApp assistant understands patient messages.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <textarea
          className="input-field min-h-28"
          placeholder="Example: I want to book an eye test tomorrow"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <button
          onClick={handleTest}
          className="btn-whatsapp h-fit gap-2"
        >
          <Send size={16} />
          Test Message
        </button>
      </div>

      {result && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="badge-info">
              Clinic: {result.clinicId}
            </span>

            <span className="badge-success">
              Intent: {result.intent}
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-700">
            Bot Reply
          </p>

          <p className="mt-2 rounded-xl bg-white p-4 text-sm leading-relaxed text-slate-600">
            {result.reply}
          </p>
        </div>
      )}
    </div>
  );
}