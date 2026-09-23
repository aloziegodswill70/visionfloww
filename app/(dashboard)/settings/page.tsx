import PageShell from "@/components/PageShell";

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      subtitle="Configure clinic profile, WhatsApp templates and automation rules."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="text-xl font-bold text-slate-950 mb-4">
            Clinic Profile
          </h3>

          <div className="space-y-4">
            <input className="input-field" placeholder="Clinic name" />
            <input className="input-field" placeholder="Clinic phone number" />
            <input className="input-field" placeholder="Clinic branch address" />
            <input className="input-field" placeholder="Google review link" />
          </div>

          <button className="btn-primary mt-5">Save Profile</button>
        </div>

        <div className="card card-padding">
          <h3 className="text-xl font-bold text-slate-950 mb-4">
            WhatsApp Templates
          </h3>

          <div className="space-y-4">
            <textarea
              className="input-field min-h-24"
              placeholder="Appointment reminder message"
            />
            <textarea
              className="input-field min-h-24"
              placeholder="Glasses ready message"
            />
            <textarea
              className="input-field min-h-24"
              placeholder="Review request message"
            />
          </div>

          <button className="btn-primary mt-5">Save Templates</button>
        </div>
      </div>
    </PageShell>
  );
}