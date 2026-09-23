"use client";

import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Power,
  X,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";

type StaffRole =
  | "DOCTOR"
  | "RECEPTIONIST"
  | "OPTICIAN"
  | "ACCOUNTANT"
  | "MANAGER";

type Branch = {
  id: string;
  name: string;
  isMain: boolean;
  isActive: boolean;
};

type Staff = {
  id: string;
  clinicId: string | null;
  branchId: string | null;
  fullName: string;
  email: string;
  role: StaffRole;
  status: string;
  createdAt: string;
  updatedAt: string;
  branch: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
};

type StaffForm = {
  fullName: string;
  email: string;
  password: string;
  role: StaffRole;
  branchId: string;
};

const ROLE_OPTIONS: {
  value: StaffRole;
  label: string;
}[] = [
  { value: "DOCTOR", label: "Doctor" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "OPTICIAN", label: "Optician" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "MANAGER", label: "Manager" },
];

const EMPTY_FORM: StaffForm = {
  fullName: "",
  email: "",
  password: "",
  role: "DOCTOR",
  branchId: "",
};

function roleLabel(role: StaffRole) {
  const found = ROLE_OPTIONS.find((item) => item.value === role);
  return found?.label ?? role;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [staffResponse, branchResponse] = await Promise.all([
        fetch("/api/staff", {
          cache: "no-store",
        }),
        fetch("/api/branches", {
          cache: "no-store",
        }),
      ]);

      const staffData = await staffResponse.json();
      const branchData = await branchResponse.json();

      if (!staffResponse.ok || !staffData.success) {
        throw new Error(
          staffData.error || "Failed to fetch staff."
        );
      }

      if (!branchResponse.ok || !branchData.success) {
        throw new Error(
          branchData.error || "Failed to fetch branches."
        );
      }

      setStaff(staffData.staff ?? []);
      setBranches(branchData.branches ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load staff."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesSearch =
        !query ||
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        roleLabel(member.role).toLowerCase().includes(query) ||
        member.branch?.name.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "ALL" || member.role === roleFilter;

      const matchesBranch =
        branchFilter === "ALL" ||
        member.branchId === branchFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesBranch
      );
    });
  }, [staff, search, roleFilter, branchFilter]);

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.status === "active"
  ).length;

  const inactiveStaff = staff.filter(
    (member) => member.status !== "active"
  ).length;

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(member: Staff) {
    setEditingId(member.id);

    setForm({
      fullName: member.fullName,
      email: member.email,
      password: "",
      role: member.role,
      branchId: member.branchId ?? "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.fullName.trim()) {
        throw new Error("Full name is required.");
      }

      if (!form.email.trim()) {
        throw new Error("Email address is required.");
      }

      if (!editingId && form.password.length < 8) {
        throw new Error(
          "Password must be at least 8 characters."
        );
      }

      const payload: Record<string, unknown> = {
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        branchId: form.branchId || null,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const response = await fetch(
        editingId
          ? `/api/staff/${editingId}`
          : "/api/staff",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            (editingId
              ? "Failed to update staff."
              : "Failed to create staff.")
        );
      }

      setSuccess(
        editingId
          ? "Staff account updated successfully."
          : "Staff account created successfully."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStaff(member: Staff) {
    try {
      setTogglingId(member.id);
      setError("");
      setSuccess("");

      const nextStatus =
        member.status === "active"
          ? "inactive"
          : "active";

      const response = await fetch(
        `/api/staff/${member.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to update staff status."
        );
      }

      setSuccess(
        nextStatus === "active"
          ? "Staff account activated."
          : "Staff account deactivated."
      );

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update staff status."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteStaff(member: Staff) {
    const confirmed = window.confirm(
      `Delete ${member.fullName}'s staff account?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(member.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/staff/${member.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to delete staff."
        );
      }

      setSuccess(
        `${member.fullName} has been deleted successfully.`
      );

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete staff."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="app-shell min-h-screen">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-clinic-blue">
              Clinic Management
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
              Staff Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage doctors, receptionists, opticians,
              accountants, and managers across your clinic
              branches.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <UserPlus size={18} />
              Add Staff
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="card card-padding">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Staff
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {totalStaff}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-clinic-blue">
                <Users size={21} />
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Active Staff
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {activeStaff}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck size={21} />
              </div>
            </div>
          </div>

          <div className="card card-padding">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Inactive Staff
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {inactiveStaff}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <UserX size={21} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 card card-padding">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search staff..."
                className="input-field pl-10"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="input-field"
            >
              <option value="ALL">All Roles</option>

              {ROLE_OPTIONS.map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                >
                  {role.label}
                </option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(event) =>
                setBranchFilter(event.target.value)
              }
              className="input-field"
            >
              <option value="ALL">All Branches</option>

              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="card card-padding text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-clinic-blue" />
              <p className="mt-3 text-sm text-slate-500">
                Loading staff...
              </p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="card card-padding text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={25} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No staff found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {staff.length === 0
                  ? "Create your first staff account to get started."
                  : "Try changing your search or filters."}
              </p>

              {staff.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white"
                >
                  <UserPlus size={17} />
                  Add Staff
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredStaff.map((member) => {
                const isActive =
                  member.status === "active";

                return (
                  <div
                    key={member.id}
                    className="card overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-clinic-blue text-lg font-bold text-white">
                            {member.fullName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-950">
                              {member.fullName}
                            </h3>

                            <p className="truncate text-sm text-slate-500">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3">
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                          <span className="text-xs text-slate-500">
                            Role
                          </span>

                          <span className="text-sm font-semibold text-slate-800">
                            {roleLabel(member.role)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                          <span className="text-xs text-slate-500">
                            Branch
                          </span>

                          <span className="truncate text-right text-sm font-semibold text-slate-800">
                            {member.branch?.name ??
                              "All / Unassigned"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(member)
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleStaff(member)
                        }
                        disabled={
                          togglingId === member.id
                        }
                        title={
                          isActive
                            ? "Deactivate staff"
                            : "Activate staff"
                        }
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:opacity-50 ${
                          isActive
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <Power size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteStaff(member)
                        }
                        disabled={
                          deletingId === member.id
                        }
                        title="Delete staff"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={closeForm}
          />

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 md:px-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {editingId
                    ? "Edit Staff"
                    : "Add Staff"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update this staff member's account."
                    : "Create a new clinic staff account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 md:p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="e.g. Dr. John Doe"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="staff@example.com"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target
                          .value as StaffRole,
                      }))
                    }
                    className="input-field"
                    required
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Branch
                  </label>

                  <select
                    value={form.branchId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        branchId: event.target.value,
                      }))
                    }
                    className="input-field"
                  >
                    <option value="">
                      Unassigned / All Branches
                    </option>

                    {branches
                      .filter(
                        (branch) => branch.isActive
                      )
                      .map((branch) => (
                        <option
                          key={branch.id}
                          value={branch.id}
                        >
                          {branch.name}
                          {branch.isMain
                            ? " (Main)"
                            : ""}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {editingId
                      ? "New Password"
                      : "Password"}
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder={
                      editingId
                        ? "Leave blank to keep current password"
                        : "Minimum 8 characters"
                    }
                    className="input-field"
                    required={!editingId}
                    minLength={8}
                  />

                  {editingId && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      Leave blank if you do not want to
                      change the password.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-800">
                  Staff members can sign in using the
                  email and password created here. Their
                  access remains restricted to this clinic.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Staff"
                      : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}