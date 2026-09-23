"use client";

import { useState } from "react";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";

export default function WhatsAppConsole() {
  const [selectedPatientId, setSelectedPatientId] =
    useState<string | null>(null);

  return (
    <div className="card overflow-hidden">
      <div className="grid min-h-[520px] lg:grid-cols-[360px_1fr]">
        <ChatList
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
        />

        <ChatWindow
          selectedPatientId={selectedPatientId}
        />
      </div>
    </div>
  );
}