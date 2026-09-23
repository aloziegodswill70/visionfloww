import PageShell from "@/components/PageShell";
import ReminderSchedulerPanel from "@/components/ReminderSchedulerPanel";

export default function RemindersPage() {
  return (
    <PageShell
      title="Reminder Scheduler"
      subtitle="Monitor appointment, follow-up, medication and optical pickup reminders."
    >
      <ReminderSchedulerPanel />
    </PageShell>
  );
}