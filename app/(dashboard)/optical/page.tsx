import PageShell from "@/components/PageShell";
import OpticalQueuePanel from "@/components/OpticalQueuePanel";

export default function OpticalPage() {
  return (
    <PageShell
      title="Optical Pickup Automation"
      subtitle="Manage glasses orders, pickup reminders and optical delivery workflow."
    >
      <OpticalQueuePanel />
    </PageShell>
  );
}