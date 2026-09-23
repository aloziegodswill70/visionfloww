import PageShell from "@/components/PageShell";
import ReceptionQueuePanel from "@/components/ReceptionQueuePanel";

export default function ReceptionPage() {
  return (
    <PageShell
      title="Reception Control"
      subtitle="Confirm appointments, manage patient arrival and queue unclear WhatsApp messages for staff."
    >
      <ReceptionQueuePanel />
    </PageShell>
  );
}