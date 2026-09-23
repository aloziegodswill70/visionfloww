import PageShell from "@/components/PageShell";
import DoctorQueuePanel from "@/components/DoctorQueuePanel";

export default function DoctorPage() {
  return (
    <PageShell
      title="Doctor Workflow"
      subtitle="Set medication dosage and follow-up appointment reminders after consultation."
    >
      <DoctorQueuePanel />
    </PageShell>
  );
}