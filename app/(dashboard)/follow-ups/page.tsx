import PageShell from "@/components/PageShell";
import { Clock, Send } from "lucide-react";

const followUps = [
  {
    patient: "Chinedu Okafor",
    type: "Glaucoma review",
    due: "Tomorrow",
  },
  {
    patient: "Ada Johnson",
    type: "Drug compliance check",
    due: "In 3 days",
  },
  {
    patient: "Mary Peters",
    type: "New glasses adaptation",
    due: "Next week",
  },
];

export default function FollowUpsPage() {
  return (
    <PageShell
      title="Follow-ups"
      subtitle="Schedule and send patient review messages automatically."
    >
      <div className="grid md:grid-cols-3 gap-5">
        {followUps.map((item) => (
          <div key={item.patient} className="card card-padding">
            <div className="h-12 w-12 rounded-2xl bg-sky-100 text-clinic-blue flex items-center justify-center mb-4">
              <Clock size={22} />
            </div>

            <h3 className="font-bold text-slate-950">{item.patient}</h3>

            <p className="text-sm text-slate-500 mt-2">{item.type}</p>

            <p className="text-sm font-semibold text-slate-700 mt-3">
              Due: {item.due}
            </p>

            <button className="btn-primary mt-5 w-full gap-2">
              <Send size={16} />
              Send Follow-up
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}