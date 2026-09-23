"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronRight,
  Edit3,
  Filter,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  isActive: boolean;
};

type Patient = {
  id: string;
  fullName: string;
  phone: string;
  gender: string | null;
  status: string;
  lastVisit: string | null;
  branch: Branch | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    appointments: number;
    whatsappMessages: number;
    opticalOrders: number;
    medicationReminders: number;
    followUpReminders: number;
  };
};

type PatientForm = {
  fullName: string;
  phone: string;
  gender: string;
  branchId: string;
  status: string;
};

const emptyForm: PatientForm = {
  fullName: "",
  phone: "",
  gender: "",
  branchId: "",
  status: "Active",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<PatientForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPatients() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter !== "All") {
        params.set("status", statusFilter);
      }

      if (branchFilter !== "All") {
        params.set("branchId", branchFilter);
      }

      const response = await fetch(`/api/patients?${params.toString()}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load patients.");
      }

      setPatients(data.patients || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load patients."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadBranches() {
    try {
      const response = await fetch("/api/branches");
      const data = await response.json();

      if (response.ok) {
        setBranches(
          (data.branches || []).filter((branch: Branch) => branch.isActive)
        );
      }
    } catch {
      // Patient loading should not fail because branch loading failed.
    }
  }

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPatients();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, statusFilter, branchFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEdit(patient: Patient) {
    setEditingId(patient.id);

    setForm({
      fullName: patient.fullName,
      phone: patient.phone,
      gender: patient.gender || "",
      branchId: patient.branch?.id || "",
      status: patient.status,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        editingId ? `/api/patients/${editingId}` : "/api/patients",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save patient.");
      }

      setSuccess(
        editingId
          ? "Patient updated successfully."
          : "Patient created successfully."
      );

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadPatients();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save patient."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(patient: Patient) {
    const nextStatus = patient.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `Are you sure you want to mark ${patient.fullName} as ${nextStatus.toLowerCase()}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: patient.fullName,
          phone: patient.phone,
          gender: patient.gender || "",
          branchId: patient.branch?.id || "",
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update patient.");
      }

      setSuccess(
        `${patient.fullName} is now ${nextStatus.toLowerCase()}.`
      );

      await loadPatients();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update patient."
      );
    }
  }

  const summary = useMemo(() => {
    const active = patients.filter(
      (patient) => patient.status === "Active"
    ).length;

    const inactive = patients.filter(
      (patient) => patient.status === "Inactive"
    ).length;

    const appointments = patients.reduce(
      (total, patient) => total + patient._count.appointments,
      0
    );

    return {
      total: patients.length,
      active,
      inactive,
      appointments,
    };
  }, [patients]);

  return (
    <main className="app-shell min-h-screen">
      <section className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-clinic-blue">
                <Users size={14} />
                Patient Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                Patients
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your clinic patients, view their history, and keep
                patient records organized across your branches.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus size={18} />
              Add Patient
            </button>
          </div>

          {/* ALERTS */}
          {success && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          {error && !showModal && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* SUMMARY */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Patients"
              value={summary.total}
              icon={Users}
            />

            <SummaryCard
              label="Active Patients"
              value={summary.active}
              icon={Activity}
            />

            <SummaryCard
              label="Inactive Patients"
              value={summary.inactive}
              icon={UserRound}
            />

            <SummaryCard
              label="Appointments"
              value={summary.appointments}
              icon={ChevronRight}
            />
          </div>

          {/* FILTERS */}
          <div className="card card-padding mt-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search patient name or phone number..."
                  className="input-field pl-11"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="input-field min-w-[170px] pl-9"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <select
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                  className="input-field min-w-[190px]"
                >
                  <option value="All">All Branches</option>

                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PATIENTS */}
          <div className="mt-6">
            {loading ? (
              <div className="card flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Loader2 size={20} className="animate-spin" />
                  Loading patients...
                </div>
              </div>
            ) : patients.length === 0 ? (
              <div className="card flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-clinic-blue">
                  <Users size={30} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-950">
                  No patients found
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search || statusFilter !== "All" || branchFilter !== "All"
                    ? "Try changing your search or filters."
                    : "Your patient register is currently empty. Add your first patient to get started."}
                </p>

                {!search &&
                  statusFilter === "All" &&
                  branchFilter === "All" && (
                    <button
                      type="button"
                      onClick={openCreate}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Plus size={18} />
                      Add First Patient
                    </button>
                  )}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {patients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onEdit={() => openEdit(patient)}
                    onToggleStatus={() => toggleStatus(patient)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {editingId ? "Edit Patient" : "Add New Patient"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingId
                    ? "Update the patient's information below."
                    : "Create a patient record for your clinic."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        fullName: event.target.value,
                      })
                    }
                    placeholder="Enter patient's full name"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone: event.target.value,
                      })
                    }
                    placeholder="e.g. 08012345678"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gender
                  </label>

                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        gender: event.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Branch
                  </label>

                  <select
                    value={form.branchId}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        branchId: event.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="">Unassigned</option>

                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 size={17} className="animate-spin" />
                  )}

                  {editingId ? "Save Changes" : "Create Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="card card-padding">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-clinic-blue">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function PatientCard({
  patient,
  onEdit,
  onToggleStatus,
}: {
  patient: Patient;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-clinic-blue">
              <UserRound size={22} />
            </div>

            <div className="min-w-0">
              <Link
                href={`/patients/${patient.id}`}
                className="block truncate text-base font-bold text-slate-950 transition hover:text-clinic-blue"
              >
                {patient.fullName}
              </Link>

              <p className="mt-1 text-xs text-slate-500">
                {patient.gender || "Gender not recorded"}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              patient.status === "Active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {patient.status}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <Phone size={16} className="text-slate-400" />
            <span className="truncate text-sm font-medium text-slate-700">
              {patient.phone}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <Activity size={16} className="text-slate-400" />
            <span className="truncate text-sm font-medium text-slate-700">
              {patient.branch?.name || "Unassigned"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
          <MiniStat
            label="Visits"
            value={patient._count.appointments}
          />

          <MiniStat
            label="WhatsApp"
            value={patient._count.whatsappMessages}
          />

          <MiniStat
            label="Orders"
            value={patient._count.opticalOrders}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/patients/${patient.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-clinic-blue px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            View Patient
            <ChevronRight size={16} />
          </Link>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={onToggleStatus}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {patient.status === "Active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-slate-950">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[11px] font-medium text-slate-400">
        {label}
      </p>
    </div>
  );
}