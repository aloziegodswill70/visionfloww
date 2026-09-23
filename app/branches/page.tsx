"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Edit3,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
  Power,
  Loader2,
} from "lucide-react";

type Branch = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
};

type BranchForm = {
  name: string;
  address: string;
  phone: string;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<BranchForm>({
    name: "",
    address: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * =========================================================
   * FETCH BRANCHES
   * =========================================================
   */
  async function fetchBranches() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/branches", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load branches.");
      }

      setBranches(Array.isArray(data?.branches) ? data.branches : []);
    } catch (err) {
      console.error("FETCH BRANCHES ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load branches. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBranches();
  }, []);

  /**
   * =========================================================
   * RESET FORM
   * =========================================================
   */
  function resetForm() {
    setForm({
      name: "",
      address: "",
      phone: "",
    });

    setEditingId(null);
    setError("");
  }

  /**
   * =========================================================
   * START EDIT
   * =========================================================
   */
  function startEdit(branch: Branch) {
    setEditingId(branch.id);

    setForm({
      name: branch.name,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /**
   * =========================================================
   * CREATE / UPDATE BRANCH
   * =========================================================
   */
  async function handleSubmit() {
    const name = form.name.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();

    setError("");
    setSuccess("");

    if (!name) {
      setError("Branch name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        editingId
          ? `/api/branches/${editingId}`
          : "/api/branches",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            address: address || null,
            phone: phone || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (editingId
              ? "Failed to update branch."
              : "Failed to create branch.")
        );
      }

      setSuccess(
        editingId
          ? "Branch updated successfully."
          : "Branch created successfully."
      );

      resetForm();

      await fetchBranches();
    } catch (err) {
      console.error("SAVE BRANCH ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save branch. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * =========================================================
   * ACTIVATE / DEACTIVATE BRANCH
   * =========================================================
   */
  async function toggleBranch(branch: Branch) {
    if (branch.isMain && branch.isActive) {
      setError(
        "The main branch cannot be deactivated. Create another active branch first if you need to change your branch structure."
      );
      return;
    }

    setError("");
    setSuccess("");

    try {
      setTogglingId(branch.id);

      const response = await fetch(`/api/branches/${branch.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !branch.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Failed to ${
              branch.isActive ? "deactivate" : "activate"
            } branch.`
        );
      }

      setSuccess(
        branch.isActive
          ? "Branch deactivated successfully."
          : "Branch activated successfully."
      );

      await fetchBranches();
    } catch (err) {
      console.error("TOGGLE BRANCH ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update branch status."
      );
    } finally {
      setTogglingId(null);
    }
  }

  /**
   * =========================================================
   * DELETE BRANCH
   * =========================================================
   */
  async function deleteBranch(branch: Branch) {
    if (branch.isMain) {
      setError("The main branch cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${branch.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setDeletingId(branch.id);

      const response = await fetch(`/api/branches/${branch.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete branch."
        );
      }

      setSuccess("Branch deleted successfully.");

      if (editingId === branch.id) {
        resetForm();
      }

      await fetchBranches();
    } catch (err) {
      console.error("DELETE BRANCH ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete branch."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /**
   * =========================================================
   * SEARCH
   * =========================================================
   */
  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return branches;
    }

    return branches.filter((branch) => {
      return (
        branch.name.toLowerCase().includes(query) ||
        branch.address?.toLowerCase().includes(query) ||
        branch.phone?.toLowerCase().includes(query)
      );
    });
  }, [branches, search]);

  const activeBranches = branches.filter(
    (branch) => branch.isActive
  ).length;

  const inactiveBranches = branches.filter(
    (branch) => !branch.isActive
  ).length;

  /**
   * =========================================================
   * UI
   * =========================================================
   */
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
                  <Building2 size={24} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">
                    Branches
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your clinic locations and branch information.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus size={18} />
              Add Branch
            </button>
          </div>
        </div>

        {/* =====================================================
            ALERTS
        ===================================================== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-500 hover:text-red-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              {success}
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0 text-green-500 hover:text-green-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card card-padding">
            <p className="text-sm text-slate-500">
              Total Branches
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {branches.length}
            </p>
          </div>

          <div className="card card-padding">
            <p className="text-sm text-slate-500">
              Active Branches
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-3xl font-bold text-slate-950">
                {activeBranches}
              </p>

              <span className="badge-success">
                Active
              </span>
            </div>
          </div>

          <div className="card card-padding">
            <p className="text-sm text-slate-500">
              Inactive Branches
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-3xl font-bold text-slate-950">
                {inactiveBranches}
              </p>

              <span className="badge-warning">
                Inactive
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            CREATE / EDIT FORM
        ===================================================== */}
        <div className="card card-padding mb-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {editingId ? "Edit Branch" : "Add New Branch"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingId
                  ? "Update the branch information below."
                  : "Create a new location for your clinic."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="branch-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Branch Name
              </label>

              <input
                id="branch-name"
                type="text"
                placeholder="e.g. Ikeja Branch"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                disabled={saving}
                className="input-field w-full"
              />
            </div>

            <div>
              <label
                htmlFor="branch-phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone Number
              </label>

              <input
                id="branch-phone"
                type="tel"
                placeholder="e.g. 08012345678"
                value={form.phone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone: event.target.value,
                  })
                }
                disabled={saving}
                className="input-field w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="branch-address"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Address
              </label>

              <input
                id="branch-address"
                type="text"
                placeholder="Enter complete branch address"
                value={form.address}
                onChange={(event) =>
                  setForm({
                    ...form,
                    address: event.target.value,
                  })
                }
                disabled={saving}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  {editingId
                    ? "Updating..."
                    : "Creating..."}
                </>
              ) : (
                <>
                  {editingId ? (
                    <Edit3 size={17} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {editingId
                    ? "Update Branch"
                    : "Create Branch"}
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            BRANCH LIST
        ===================================================== */}
        <div className="card card-padding">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                All Branches
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredBranches.length} branch
                {filteredBranches.length === 1
                  ? ""
                  : "es"}{" "}
                displayed
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search branches..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="input-field w-full pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading branches...
              </div>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Building2 size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                {search
                  ? "No branches found"
                  : "No branches yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Create your first branch to start managing your clinic locations."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-clinic-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Plus size={17} />
                  Add Branch
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className={`rounded-2xl border p-5 transition ${
                    branch.isActive
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50 opacity-80"
                  }`}
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {branch.name}
                        </h3>

                        {branch.isMain && (
                          <span className="badge-info">
                            Main Branch
                          </span>
                        )}

                        {branch.isActive ? (
                          <span className="badge-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge-warning">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <span>
                            {branch.address ||
                              "No address provided"}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone
                            size={17}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <span>
                            {branch.phone ||
                              "No phone number provided"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-400">
                        Created{" "}
                        {new Date(
                          branch.createdAt
                        ).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(branch)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleBranch(branch)
                        }
                        disabled={
                          togglingId === branch.id ||
                          (branch.isMain &&
                            branch.isActive)
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          branch.isActive
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {togglingId === branch.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Power size={16} />
                        )}

                        {branch.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      {!branch.isMain && (
                        <button
                          type="button"
                          onClick={() =>
                            deleteBranch(branch)
                          }
                          disabled={
                            deletingId === branch.id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === branch.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}

                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}