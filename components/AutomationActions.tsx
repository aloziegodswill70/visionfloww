import { Bell, Glasses, Star, Clock } from "lucide-react";

const automations = [
  {
    title: "Appointment Reminder",
    description: "Send reminders before patient visits.",
    icon: Bell,
  },
  {
    title: "Glasses Ready Alert",
    description: "Notify patients when lenses are ready.",
    icon: Glasses,
  },
  {
    title: "Google Review Request",
    description: "Ask happy patients for clinic reviews.",
    icon: Star,
  },
  {
    title: "Follow-up Message",
    description: "Check patient recovery after treatment.",
    icon: Clock,
  },
];

export default function AutomationActions() {
  return (
    <div className="card card-padding mt-6">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-950">
          Automation Actions
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Common WhatsApp workflows for eye clinics.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {automations.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 p-5 hover:border-sky-300 transition"
            >
              <div className="h-12 w-12 rounded-2xl bg-sky-100 text-clinic-blue flex items-center justify-center mb-4">
                <Icon size={23} />
              </div>

              <h4 className="font-bold text-slate-950">
                {item.title}
              </h4>

              <p className="text-sm text-slate-500 mt-2">
                {item.description}
              </p>

              <button className="btn-soft mt-4 w-full">
                Configure
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}