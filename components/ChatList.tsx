"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  MessageCircle,
  UserRound,
} from "lucide-react";

interface Conversation {
  patientId: string;
  patientName: string;
  phone: string;
  branchId?: string | null;
  branch?: {
    id: string;
    name: string;
  } | null;
  latestMessage: string;
  latestMessageAt: string | null;
  latestDirection: string | null;
  latestStatus: string | null;
  hasMessages: boolean;
}

interface ChatListProps {
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
}

function formatChatTime(createdAt: string | null) {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export default function ChatList({
  selectedPatientId,
  onSelectPatient,
}: ChatListProps) {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/whatsapp/messages",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load WhatsApp conversations."
        );
      }

      setConversations(
        Array.isArray(data?.conversations)
          ? data.conversations
          : []
      );
    } catch (error) {
      console.error(
        "ChatList load error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load WhatsApp conversations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();

    const interval = window.setInterval(
      loadConversations,
      15000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [loadConversations]);

  if (loading) {
    return (
      <div className="border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-bold text-slate-950">
            Conversations
          </h3>

          <p className="text-sm text-slate-500">
            WhatsApp patient conversations
          </p>
        </div>

        <div className="flex items-center justify-center p-8">
          <Loader2
            size={22}
            className="animate-spin text-slate-400"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-r border-slate-200 bg-white">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-950">
              Conversations
            </h3>

            <p className="text-sm text-slate-500">
              WhatsApp patient conversations
            </p>
          </div>

          {conversations.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {conversations.length}
            </span>
          )}
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error ? (
        <div className="p-4">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}

            <button
              type="button"
              onClick={loadConversations}
              className="mt-3 block font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        /* ===================================================
            EMPTY STATE
        ==================================================== */
        <div className="p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            <MessageCircle size={21} />
          </div>

          <p className="font-semibold text-slate-700">
            No patients found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Patients will appear here when they are
            registered in your clinic.
          </p>
        </div>
      ) : (
        /* ===================================================
            CONVERSATION LIST
        ==================================================== */
        <div className="divide-y divide-slate-100">
          {conversations.map((conversation) => {
            const isActive =
              selectedPatientId ===
              conversation.patientId;

            const hasMessages =
              conversation.hasMessages;

            return (
              <button
                key={conversation.patientId}
                type="button"
                onClick={() =>
                  onSelectPatient(
                    conversation.patientId
                  )
                }
                className={`flex w-full items-start gap-3 p-4 text-left transition ${
                  isActive
                    ? "bg-sky-50"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* =================================================
                    AVATAR
                ================================================== */}
                <div
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    hasMessages
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {hasMessages ? (
                    <MessageCircle size={18} />
                  ) : (
                    <UserRound size={18} />
                  )}

                  {/* Online/new indicator */}
                  {!hasMessages && (
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-sky-500" />
                  )}
                </div>

                {/* =================================================
                    PATIENT INFORMATION
                ================================================== */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="truncate font-semibold text-slate-900">
                      {conversation.patientName}
                    </h4>

                    {conversation.latestMessageAt && (
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatChatTime(
                          conversation.latestMessageAt
                        )}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  {conversation.phone && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {conversation.phone}
                    </p>
                  )}

                  {/* Branch */}
                  {conversation.branch?.name && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {conversation.branch.name}
                    </p>
                  )}

                  {/* =================================================
                      LATEST MESSAGE / NEW PATIENT
                  ================================================== */}
                  {hasMessages ? (
                    <p
                      className={`mt-1 truncate text-sm ${
                        conversation.latestDirection ===
                        "incoming"
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {conversation.latestDirection ===
                        "outgoing" && (
                        <span className="mr-1 font-medium">
                          You:
                        </span>
                      )}

                      {conversation.latestMessage}
                    </p>
                  ) : (
                    <p className="mt-1 truncate text-sm font-medium text-sky-600">
                      Start WhatsApp conversation
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}