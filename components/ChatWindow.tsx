"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  Loader2,
  Send,
} from "lucide-react";

import MessageBubble from "@/components/MessageBubble";
import { orchestrateIncomingMessage } from "@/lib/orchestrator";

interface ChatMessage {
  id: string;
  clinicId: string;
  branchId?: string | null;
  patientId: string | null;
  patientName: string | null;
  phone: string | null;
  direction: string;
  text: string;
  status: string;
  intent?: string | null;
  createdAt: string;
}

interface ChatWindowProps {
  selectedPatientId: string | null;
}

export default function ChatWindow({
  selectedPatientId,
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [autoReplying, setAutoReplying] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!selectedPatientId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/whatsapp/messages?patientId=${encodeURIComponent(
          selectedPatientId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load conversation."
        );
      }

      setMessages(data.messages ?? []);
    } catch (error) {
      console.error("ChatWindow load error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load conversation."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    loadMessages();

    if (!selectedPatientId) {
      return;
    }

    const interval = window.setInterval(loadMessages, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedPatientId, loadMessages]);

  const selectedPatientName = useMemo(() => {
    return (
      messages.find((message) => message.patientName)
        ?.patientName || "WhatsApp Patient"
    );
  }, [messages]);

  async function handleSend() {
    const text = draft.trim();

    if (!text || !selectedPatientId || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        "/api/whatsapp/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: selectedPatientId,
            text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to send message."
        );
      }

      setDraft("");

      await loadMessages();
    } catch (error) {
      console.error("Send WhatsApp message error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleAutoReply() {
    if (
      !selectedPatientId ||
      messages.length === 0 ||
      autoReplying
    ) {
      return;
    }

    const incomingMessage = [...messages]
      .reverse()
      .find(
        (message) => message.direction === "incoming"
      );

    if (!incomingMessage) {
      setError(
        "There is no incoming patient message to process."
      );
      return;
    }

    try {
      setAutoReplying(true);
      setError("");

      const response = orchestrateIncomingMessage(
        incomingMessage.text
      );

      /**
       * Persist the orchestrator response through the same
       * secure API used for staff replies.
       */
      const saveResponse = await fetch(
        "/api/whatsapp/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: selectedPatientId,
            text: response.reply,
          }),
        }
      );

      const data = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          data?.message ||
            "Failed to save automated response."
        );
      }

      await loadMessages();
    } catch (error) {
      console.error(
        "WhatsApp orchestrator error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to run WhatsApp automation."
      );
    } finally {
      setAutoReplying(false);
    }
  }

  if (!selectedPatientId) {
    return (
      <div className="flex min-h-[520px] items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <Bot size={26} />
          </div>

          <h3 className="text-lg font-bold text-slate-950">
            Select a WhatsApp conversation
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Choose a patient chat to view messages and
            test automation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[520px] flex-col bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-950">
            {selectedPatientName}
          </h3>

          <p className="text-sm text-green-600">
            WhatsApp conversation
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoReply}
          disabled={
            autoReplying ||
            loading ||
            messages.length === 0
          }
          className="btn-soft gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {autoReplying ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Bot size={16} />
          )}

          {autoReplying
            ? "Processing..."
            : "Run Orchestrator"}
        </button>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2
              size={24}
              className="animate-spin text-slate-400"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <MessageEmptyIcon />

              <p className="mt-3 font-semibold text-slate-700">
                No messages yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Send a message to begin this conversation.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={{
                id: message.id,
                clinicId: message.clinicId,
                patientId: message.patientId,
                patientName: message.patientName,
                direction: message.direction,
                text: message.text,
                createdAt: new Date(message.createdAt),
                status: message.status,
              }}
            />
          ))
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(event) =>
              setDraft(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleSend();
              }
            }}
            className="input-field"
            placeholder="Type a reply..."
            disabled={sending}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={
              sending ||
              !draft.trim()
            }
            className="btn-whatsapp gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send size={16} />
            )}

            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageEmptyIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Bot size={22} />
    </div>
  );
}