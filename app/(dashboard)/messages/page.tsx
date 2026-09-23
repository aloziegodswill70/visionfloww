import PageShell from "@/components/PageShell";
import WhatsAppConsole from "@/components/WhatsAppConsole";

export default function MessagesPage() {
  return (
    <PageShell
      title="WhatsApp Inbox"
      subtitle="Manage patient conversations, staff replies and automation orchestration."
    >
      <WhatsAppConsole />
    </PageShell>
  );
}