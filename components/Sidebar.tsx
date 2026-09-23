"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MessageCircle,
  Bell,
  Glasses,
  Settings,
  Menu,
  X,
  Workflow,
  Activity,
  ClipboardList,
  Stethoscope,
  AlarmClock,
  GitBranch,
  UserCog,
} from "lucide-react";
import { useState } from "react";

const links = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Reception",
    href: "/reception",
    icon: ClipboardList,
  },
  {
    name: "Doctor",
    href: "/doctor",
    icon: Stethoscope,
  },
  {
    name: "Reminders",
    href: "/reminders",
    icon: AlarmClock,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: CalendarCheck,
  },
  {
    name: "WhatsApp Inbox",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    name: "Follow-ups",
    href: "/follow-ups",
    icon: Bell,
  },
  {
    name: "Optical Alerts",
    href: "/optical",
    icon: Glasses,
  },
  {
    name: "Staff",
    href: "/staff",
    icon: UserCog,
  },
  {
    name: "Branches",
    href: "/branches",
    icon: GitBranch,
  },
  {
    name: "Automations",
    href: "/automations",
    icon: Workflow,
  },
  {
    name: "Executions",
    href: "/executions",
    icon: Activity,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          VisionFlow
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Eye Clinic WhatsApp Automation
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          const isActive =
            pathname === link.href ||
            (link.href !== "/" &&
              pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-clinic-blue text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />

              <span className="text-sm font-medium">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-clinic-dark text-white shadow-soft lg:hidden"
      >
        <Menu size={22} />
      </button>

      <aside className="hidden min-h-screen w-72 flex-col bg-clinic-dark p-6 text-white lg:flex">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <aside className="relative flex min-h-screen w-72 flex-col bg-clinic-dark p-6 text-white">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800"
            >
              <X size={20} />
            </button>

            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}