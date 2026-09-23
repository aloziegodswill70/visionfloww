import { Search, Bell, MessageCircle } from "lucide-react";
import NewAppointmentModal from "@/components/NewAppointmentModal";

export default function Topbar() {
  return (
    <div className="card card-padding flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h2 className="dashboard-title">
          Dashboard
        </h2>

        <p className="dashboard-subtitle">
          Manage appointments, WhatsApp chats and follow-ups.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search patient..."
            className="input-field pl-10 w-full sm:w-[250px]"
          />
        </div>

        <NewAppointmentModal />

        <button className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
          <Bell size={20} />
        </button>

        <button className="h-11 w-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center hover:opacity-90 transition">
          <MessageCircle size={20} />
        </button>
      </div>
    </div>
  );
}