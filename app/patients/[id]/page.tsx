"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  MessageCircle,
  Package,
  Phone,
  Pill,
  User,
  UserRound,
} from "lucide-react";

type Patient = {
  id: string;
  clinicId: string;
  branchId: string | null;
  fullName: string;
  phone: string;
  gender: string | null;
  status: string;
  lastVisit: string | null;
  createdAt: string;
  updatedAt: string;

  branch?: {
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
    isActive?: boolean;
  } | null;

  appointments?: Appointment[];
  whatsappMessages?: WhatsAppMessage[];
  opticalOrders?: OpticalOrder[];
  medicationReminders?: MedicationReminder[];
  followUpReminders?: FollowUpReminder[];
};

type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  reason: string;
  date: string;
  time: string;
  notes: string | null;
  status: string;
  patientConfirmed: boolean;
  receptionistConfirmed: boolean;
  createdAt: string;
};

type WhatsAppMessage = {
  id: string;
  direction: string;
  text: string;
  status: string;
  intent: string | null;
  messageId: string | null;
  createdAt: string;
};

type OpticalOrder = {
  id: string;
  patientName: string;
  lensType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type MedicationReminder = {
  id: string;
  patientName: string;
  medicationName: string;
  dosageInstruction: string;
  frequency: string;
  reminderTime: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type FollowUpReminder = {
  id: string;
  patientName: string;
  followUpDate: string;
  followUpTime: string;
  reason: string;
  reminderSchedule: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Tab =
  | "overview"
  | "appointments"
  | "whatsapp"
  | "optical"
  | "reminders";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("completed") ||
    normalized.includes("confirmed") ||
    normalized.includes("active") ||
    normalized.includes("sent")
  ) {
    return "badge-success";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("failed") ||
    normalized.includes("missed") ||
    normalized.includes("inactive")
  ) {
    return "badge-warning";
  }

  return "badge-info";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function PatientProfilePage() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Prevent duplicate profile requests during development
   * and protect against stale requests when navigating
   * between patient profiles.
   */
  const loadedPatientRef = useRef<string | null>(null);
  const loadingPatientRef = useRef<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    /*
     * If this patient is already being loaded, do not start
     * another identical request.
     *
     * This is particularly useful with React Strict Mode
     * during development.
     */
    if (
      loadedPatientRef.current === patientId ||
      loadingPatientRef.current === patientId
    ) {
      return;
    }

    const controller = new AbortController();

    loadingPatientRef.current = patientId;

    async function loadPatient() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/patients/${patientId}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load this patient's profile."
          );
        }

        if (controller.signal.aborted) {
          return;
        }

        setPatient(data.patient ?? data);
        loadedPatientRef.current = patientId;
      } catch (err) {
        /*
         * Abort errors are expected when the component is
         * unmounted or the patient ID changes.
         */
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this patient's profile."
        );
      } finally {
        if (loadingPatientRef.current === patientId) {
          loadingPatientRef.current = null;
        }

        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPatient();

    return () => {
      controller.abort();

      if (loadingPatientRef.current === patientId) {
        loadingPatientRef.current = null;
      }
    };
  }, [patientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />

          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200" />

            <div className="flex-1 space-y-3">
              <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="card card-padding h-28 animate-pulse bg-slate-50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-sm font-medium text-clinic-blue hover:underline"
        >
          <ArrowLeft size={17} />
          Back to Patients
        </Link>

        <div className="card card-padding">
          <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <UserRound size={30} />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Patient profile unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "The requested patient could not be found."}
            </p>

            <Link
              href="/patients"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <ArrowLeft size={17} />
              Return to Patients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const appointments = patient.appointments ?? [];
  const whatsappMessages = patient.whatsappMessages ?? [];
  const opticalOrders = patient.opticalOrders ?? [];
  const medicationReminders = patient.medicationReminders ?? [];
  const followUpReminders = patient.followUpReminders ?? [];

  const totalReminders =
    medicationReminders.length + followUpReminders.length;

  const upcomingAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(
      `${appointment.date}T${appointment.time || "00:00"}`
    );

    return (
      !Number.isNaN(appointmentDate.getTime()) &&
      appointmentDate >= new Date() &&
      appointment.status !== "CANCELLED"
    );
  });

  const tabs = [
    {
      id: "overview" as Tab,
      label: "Overview",
      icon: User,
    },
    {
      id: "appointments" as Tab,
      label: "Appointments",
      icon: CalendarDays,
      count: appointments.length,
    },
    {
      id: "whatsapp" as Tab,
      label: "WhatsApp",
      icon: MessageCircle,
      count: whatsappMessages.length,
    },
    {
      id: "optical" as Tab,
      label: "Optical Orders",
      icon: Package,
      count: opticalOrders.length,
    },
    {
      id: "reminders" as Tab,
      label: "Reminders",
      icon: Clock3,
      count: totalReminders,
    },
  ];

  return (
    <div className="space-y-6">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/patients"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-clinic-blue hover:underline"
          >
            <ArrowLeft size={17} />
            Back to Patients
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Patient Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View patient information, appointments, messages, orders and
            reminders.
          </p>
        </div>

        <Link
          href="/patients"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Patient List
        </Link>
      </div>

      {/* =========================================================
          PATIENT HERO
      ========================================================= */}
      <section className="card overflow-hidden">
        <div className="h-2 bg-clinic-blue" />

        <div className="card-padding">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-clinic-blue text-2xl font-bold text-white shadow-sm">
                {getInitials(patient.fullName)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {patient.fullName}
                  </h2>

                  <span
                    className={
                      patient.status.toLowerCase() === "active"
                        ? "badge-success"
                        : "badge-warning"
                    }
                  >
                    {patient.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-x-5">
                  <span className="inline-flex items-center gap-2">
                    <Phone size={16} className="text-clinic-blue" />
                    {patient.phone}
                  </span>

                  {patient.gender && (
                    <span className="inline-flex items-center gap-2">
                      <User size={16} className="text-clinic-blue" />
                      {patient.gender}
                    </span>
                  )}

                  {patient.branch?.name && (
                    <span className="inline-flex items-center gap-2">
                      <Eye size={16} className="text-clinic-blue" />
                      {patient.branch.name}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Patient ID: {patient.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${patient.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Phone size={17} />
                Call
              </a>

              <a
                href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <MessageCircle size={17} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK STATS
      ========================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Appointments
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {appointments.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-clinic-blue">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                WhatsApp Messages
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {whatsappMessages.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <MessageCircle size={21} />
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Optical Orders
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {opticalOrders.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Package size={21} />
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Reminders
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalReminders}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Clock3 size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          TABS
      ========================================================= */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto border-b border-slate-100">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                    active
                      ? "border-clinic-blue text-clinic-blue"
                      : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-800"
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}

                  {typeof tab.count === "number" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-blue-50 text-clinic-blue"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-padding">
          {/* =====================================================
              OVERVIEW
          ===================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Patient Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Basic information associated with this patient.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem
                  label="Full Name"
                  value={patient.fullName}
                  icon={<UserRound size={18} />}
                />

                <InfoItem
                  label="Phone Number"
                  value={patient.phone}
                  icon={<Phone size={18} />}
                />

                <InfoItem
                  label="Gender"
                  value={patient.gender || "Not provided"}
                  icon={<User size={18} />}
                />

                <InfoItem
                  label="Status"
                  value={patient.status}
                  icon={<CheckCircle2 size={18} />}
                />

                <InfoItem
                  label="Branch"
                  value={patient.branch?.name || "Not assigned"}
                  icon={<Eye size={18} />}
                />

                <InfoItem
                  label="Last Visit"
                  value={patient.lastVisit || "No visit recorded"}
                  icon={<CalendarDays size={18} />}
                />

                <InfoItem
                  label="Registered"
                  value={formatDate(patient.createdAt)}
                  icon={<Clock3 size={18} />}
                />

                <InfoItem
                  label="Last Updated"
                  value={formatDate(patient.updatedAt)}
                  icon={<Clock3 size={18} />}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-clinic-blue">
                      <CalendarDays size={19} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900">
                        Upcoming Appointments
                      </h4>

                      <p className="text-sm text-slate-500">
                        {upcomingAppointments.length} upcoming appointment
                        {upcomingAppointments.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {upcomingAppointments.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {upcomingAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {appointment.reason}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {appointment.date} at {appointment.time}
                              </p>
                            </div>

                            <span
                              className={getStatusClass(appointment.status)}
                            >
                              {appointment.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<CalendarDays size={22} />}
                      title="No upcoming appointments"
                      description="This patient currently has no upcoming appointments."
                    />
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <MessageCircle size={19} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900">
                        WhatsApp Activity
                      </h4>

                      <p className="text-sm text-slate-500">
                        {whatsappMessages.length} message
                        {whatsappMessages.length === 1 ? "" : "s"} recorded
                      </p>
                    </div>
                  </div>

                  {whatsappMessages.length > 0 ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {whatsappMessages[0].text}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {formatDateTime(whatsappMessages[0].createdAt)}
                      </p>
                    </div>
                  ) : (
                    <EmptyState
                      icon={<MessageCircle size={22} />}
                      title="No WhatsApp messages"
                      description="No WhatsApp conversation has been recorded for this patient."
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              APPOINTMENTS
          ===================================================== */}
          {activeTab === "appointments" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Appointment History
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  All appointments associated with this patient.
                </p>
              </div>

              {appointments.length === 0 ? (
                <EmptyState
                  icon={<CalendarDays size={28} />}
                  title="No appointments"
                  description="This patient does not have any appointments yet."
                />
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="font-semibold text-slate-900">
                              {appointment.reason}
                            </h4>

                            <span
                              className={getStatusClass(appointment.status)}
                            >
                              {appointment.status.replaceAll("_", " ")}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={16} />
                              {appointment.date}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={16} />
                              {appointment.time}
                            </span>
                          </div>

                          {appointment.notes && (
                            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                              <strong className="font-semibold text-slate-700">
                                Notes:
                              </strong>{" "}
                              {appointment.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                          {appointment.patientConfirmed && (
                            <span className="badge-success">
                              Patient Confirmed
                            </span>
                          )}

                          {appointment.receptionistConfirmed && (
                            <span className="badge-info">
                              Reception Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              WHATSAPP
          ===================================================== */}
          {activeTab === "whatsapp" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  WhatsApp Conversation
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  WhatsApp messages associated with this patient.
                </p>
              </div>

              {whatsappMessages.length === 0 ? (
                <EmptyState
                  icon={<MessageCircle size={28} />}
                  title="No WhatsApp messages"
                  description="There are no WhatsApp messages recorded for this patient."
                />
              ) : (
                <div className="space-y-3">
                  {whatsappMessages.map((message) => {
                    const outgoing =
                      message.direction.toLowerCase() === "outgoing";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          outgoing ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-3xl rounded-2xl border p-4 ${
                            outgoing
                              ? "border-blue-100 bg-blue-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {message.direction}
                            </span>

                            <span className="text-xs text-slate-400">
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {message.text}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={getStatusClass(message.status)}>
                              {message.status}
                            </span>

                            {message.intent && (
                              <span className="badge-info">
                                {message.intent}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              OPTICAL ORDERS
          ===================================================== */}
          {activeTab === "optical" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Optical Orders
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Prescription and optical orders associated with this patient.
                </p>
              </div>

              {opticalOrders.length === 0 ? (
                <EmptyState
                  icon={<Package size={28} />}
                  title="No optical orders"
                  description="This patient does not have any optical orders yet."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {opticalOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <Package size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {order.lensType}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Created {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span className={getStatusClass(order.status)}>
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-400">
                          Last updated
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDateTime(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              REMINDERS
          ===================================================== */}
          {activeTab === "reminders" && (
            <div className="space-y-8">
              {/* Medication reminders */}
              <section>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Medication Reminders
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Medication schedules associated with this patient.
                  </p>
                </div>

                {medicationReminders.length === 0 ? (
                  <EmptyState
                    icon={<Pill size={28} />}
                    title="No medication reminders"
                    description="No medication reminder has been created for this patient."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {medicationReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                              <Pill size={20} />
                            </div>

                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {reminder.medicationName}
                              </h4>

                              <p className="mt-1 text-sm text-slate-500">
                                {reminder.frequency}
                              </p>
                            </div>
                          </div>

                          <span className={getStatusClass(reminder.status)}>
                            {reminder.status}
                          </span>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-400">
                              Dosage instruction
                            </p>

                            <p className="mt-1 text-slate-700">
                              {reminder.dosageInstruction}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-400">
                                Reminder time
                              </p>

                              <p className="mt-1 font-medium text-slate-700">
                                {reminder.reminderTime}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-400">
                                Start date
                              </p>

                              <p className="mt-1 font-medium text-slate-700">
                                {reminder.startDate}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              End date
                            </p>

                            <p className="mt-1 font-medium text-slate-700">
                              {reminder.endDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Follow-up reminders */}
              <section>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Follow-up Reminders
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Scheduled follow-up communication for this patient.
                  </p>
                </div>

                {followUpReminders.length === 0 ? (
                  <EmptyState
                    icon={<CalendarDays size={28} />}
                    title="No follow-up reminders"
                    description="No follow-up reminder has been created for this patient."
                  />
                ) : (
                  <div className="space-y-3">
                    {followUpReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-clinic-blue">
                              <CalendarDays size={20} />
                            </div>

                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {reminder.reason}
                              </h4>

                              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                                <span>
                                  Date:{" "}
                                  <strong className="font-medium text-slate-700">
                                    {reminder.followUpDate}
                                  </strong>
                                </span>

                                <span>
                                  Time:{" "}
                                  <strong className="font-medium text-slate-700">
                                    {reminder.followUpTime}
                                  </strong>
                                </span>
                              </div>

                              {reminder.reminderSchedule?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {reminder.reminderSchedule.map(
                                    (schedule) => (
                                      <span
                                        key={schedule}
                                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                      >
                                        {schedule}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className={getStatusClass(reminder.status)}>
                            {reminder.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          FOOTER INFORMATION
      ========================================================= */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <FileText
            className="mt-0.5 shrink-0 text-clinic-blue"
            size={19}
          />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Patient record
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              This profile displays information associated with this patient
              within your clinic. Access to patient records remains subject to
              your clinic&apos;s role and branch permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   INFO ITEM
============================================================= */

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-clinic-blue">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        {icon}
      </div>

      <h4 className="mt-4 font-semibold text-slate-800">{title}</h4>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}