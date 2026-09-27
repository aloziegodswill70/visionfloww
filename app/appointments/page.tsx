"use client";

import { useEffect, useState } from "react";

type AppointmentStatus =
  | "PENDING_RECEPTION_CONFIRMATION"
  | "RECEPTION_CONFIRMED"
  | "PATIENT_CONFIRMED"
  | "CHECKED_IN"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED"
  | "RESCHEDULED";

type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  reason: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  branchId?: string;
  branch?: {
    id: string;
    name: string;
  };
};

type Branch = {
  id: string;
  name: string;
};

type Patient = {
  id: string;
  fullName: string;
  phone: string;
  branchId?: string | null;
};

/**
 * ==========================================
 * STATUS LABELS
 * ==========================================
 */
const statusLabels: Record<AppointmentStatus, string> = {
  PENDING_RECEPTION_CONFIRMATION:
    "Pending Reception",

  RECEPTION_CONFIRMED:
    "Reception Confirmed",

  PATIENT_CONFIRMED:
    "Patient Confirmed",

  CHECKED_IN:
    "Checked In",

  IN_CONSULTATION:
    "In Consultation",

  COMPLETED:
    "Completed",

  CANCELLED:
    "Cancelled",

  MISSED:
    "Missed",

  RESCHEDULED:
    "Rescheduled",
};

/**
 * ==========================================
 * ALLOWED NEXT ACTIONS
 * ==========================================
 */
const allowedTransitions: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  PENDING_RECEPTION_CONFIRMATION: [
    "RECEPTION_CONFIRMED",
    "CANCELLED",
    "RESCHEDULED",
  ],

  RECEPTION_CONFIRMED: [
    "PATIENT_CONFIRMED",
    "CANCELLED",
    "RESCHEDULED",
  ],

  PATIENT_CONFIRMED: [
    "CHECKED_IN",
    "MISSED",
    "CANCELLED",
    "RESCHEDULED",
  ],

  CHECKED_IN: [
    "IN_CONSULTATION",
    "CANCELLED",
  ],

  IN_CONSULTATION: [
    "COMPLETED",
  ],

  COMPLETED: [],

  CANCELLED: [],

  MISSED: [
    "RESCHEDULED",
  ],

  RESCHEDULED: [
    "RECEPTION_CONFIRMED",
    "CANCELLED",
  ],
};

/**
 * ==========================================
 * STATUS DISPLAY CLASS
 * ==========================================
 */
function getStatusStyle(
  status: AppointmentStatus
) {
  switch (status) {
    case "PENDING_RECEPTION_CONFIRMATION":
      return {
        background: "#fff7ed",
        color: "#c2410c",
      };

    case "RECEPTION_CONFIRMED":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
      };

    case "PATIENT_CONFIRMED":
      return {
        background: "#ecfdf5",
        color: "#047857",
      };

    case "CHECKED_IN":
      return {
        background: "#f0fdf4",
        color: "#15803d",
      };

    case "IN_CONSULTATION":
      return {
        background: "#f5f3ff",
        color: "#6d28d9",
      };

    case "COMPLETED":
      return {
        background: "#ecfdf5",
        color: "#166534",
      };

    case "CANCELLED":
      return {
        background: "#fef2f2",
        color: "#b91c1c",
      };

    case "MISSED":
      return {
        background: "#fff7ed",
        color: "#9a3412",
      };

    case "RESCHEDULED":
      return {
        background: "#fefce8",
        color: "#a16207",
      };

    default:
      return {
        background: "#f3f4f6",
        color: "#374151",
      };
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [branches, setBranches] =
    useState<Branch[]>([]);

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [patientsLoading, setPatientsLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    phone: "",
    reason: "",
    date: "",
    time: "",
    branchId: "",
  });

  /**
   * ==========================================
   * FETCH APPOINTMENTS
   * ==========================================
   */
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/appointments"
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to fetch appointments."
        );

        return;
      }

      setAppointments(
        data.appointments || []
      );
    } catch (error) {
      console.error(
        "Fetch appointments error:",
        error
      );

      alert(
        "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ==========================================
   * FETCH BRANCHES
   * ==========================================
   */
  const fetchBranches = async () => {
    try {
      const res = await fetch(
        "/api/branches"
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to fetch branches."
        );

        return;
      }

      const list: Branch[] =
        data.branches || [];

      setBranches(list);

      if (list.length > 0) {
        setForm((prev) => ({
          ...prev,
          branchId:
            prev.branchId || list[0].id,
        }));
      }
    } catch (error) {
      console.error(
        "Fetch branches error:",
        error
      );
    }
  };

  /**
   * ==========================================
   * FETCH PATIENTS
   * ==========================================
   */
  const fetchPatients = async () => {
    try {
      setPatientsLoading(true);

      const res = await fetch(
        "/api/patients"
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to fetch patients."
        );

        return;
      }

      setPatients(
        data.patients || []
      );
    } catch (error) {
      console.error(
        "Fetch patients error:",
        error
      );

      alert(
        "Failed to load patients."
      );
    } finally {
      setPatientsLoading(false);
    }
  };

  /**
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */
  useEffect(() => {
    fetchAppointments();
    fetchBranches();
    fetchPatients();
  }, []);

  /**
   * ==========================================
   * SELECT PATIENT
   * ==========================================
   */
  const handlePatientChange = (
    patientId: string
  ) => {
    const patient = patients.find(
      (item) => item.id === patientId
    );

    if (!patient) {
      setForm((prev) => ({
        ...prev,
        patientId: "",
        patientName: "",
        phone: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.fullName,
      phone: patient.phone,
    }));
  };

  /**
   * ==========================================
   * PATIENTS AVAILABLE FOR SELECTED BRANCH
   * ==========================================
   */
  const availablePatients =
    patients.filter((patient) => {
      if (!form.branchId) {
        return true;
      }

      if (!patient.branchId) {
        return true;
      }

      return (
        patient.branchId ===
        form.branchId
      );
    });

  /**
   * ==========================================
   * CREATE APPOINTMENT
   * ==========================================
   */
  const createAppointment = async () => {
    if (
      !form.patientId ||
      !form.patientName.trim() ||
      !form.phone.trim() ||
      !form.reason.trim() ||
      !form.date ||
      !form.time ||
      !form.branchId
    ) {
      alert(
        "Please select a patient and complete all appointment fields."
      );

      return;
    }

    try {
      const res = await fetch(
        "/api/appointments",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            patientId: form.patientId,
            patientName: form.patientName,
            phone: form.phone,
            reason: form.reason,
            date: form.date,
            time: form.time,
            branchId: form.branchId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to create appointment."
        );

        return;
      }

      alert(
        "Appointment created successfully."
      );

      setForm((prev) => ({
        ...prev,

        patientId: "",
        patientName: "",
        phone: "",
        reason: "",
        date: "",
        time: "",
      }));

      await fetchAppointments();
    } catch (error) {
      console.error(
        "Create appointment error:",
        error
      );

      alert(
        "Something went wrong while creating the appointment."
      );
    }
  };

  /**
   * ==========================================
   * START EDIT
   * ==========================================
   */
  const startEdit = (
    appointment: Appointment
  ) => {
    const matchingPatient =
      patients.find(
        (patient) =>
          patient.fullName ===
            appointment.patientName &&
          patient.phone ===
            appointment.phone
      );

    setEditingId(appointment.id);

    setForm({
      patientId:
        matchingPatient?.id || "",

      patientName:
        appointment.patientName,

      phone: appointment.phone,

      reason: appointment.reason,

      date: appointment.date,

      time: appointment.time,

      branchId:
        appointment.branchId || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * ==========================================
   * UPDATE APPOINTMENT
   * ==========================================
   */
  const updateAppointment = async () => {
    if (!editingId) return;

    if (
      !form.patientName.trim() ||
      !form.phone.trim() ||
      !form.reason.trim() ||
      !form.date ||
      !form.time ||
      !form.branchId
    ) {
      alert(
        "All appointment fields are required."
      );

      return;
    }

    try {
      const res = await fetch(
        `/api/appointments/${editingId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            patientId:
              form.patientId || undefined,
            patientName:
              form.patientName,
            phone: form.phone,
            reason: form.reason,
            date: form.date,
            time: form.time,
            branchId: form.branchId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to update appointment."
        );

        return;
      }

      alert(
        "Appointment updated successfully."
      );

      setEditingId(null);

      setForm({
        patientId: "",
        patientName: "",
        phone: "",
        reason: "",
        date: "",
        time: "",
        branchId:
          branches[0]?.id || "",
      });

      await fetchAppointments();
    } catch (error) {
      console.error(
        "Update appointment error:",
        error
      );

      alert(
        "Something went wrong while updating the appointment."
      );
    }
  };

  /**
   * ==========================================
   * DELETE APPOINTMENT
   * ==========================================
   */
  const deleteAppointment = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this appointment?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/appointments/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to delete appointment."
        );

        return;
      }

      alert(
        "Appointment deleted successfully."
      );

      await fetchAppointments();
    } catch (error) {
      console.error(
        "Delete appointment error:",
        error
      );

      alert(
        "Something went wrong while deleting the appointment."
      );
    }
  };

  /**
   * ==========================================
   * UPDATE APPOINTMENT STATUS
   * ==========================================
   */
  const updateAppointmentStatus = async (
    id: string,
    status: AppointmentStatus
  ) => {
    try {
      const res = await fetch(
        `/api/appointments/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to update appointment status."
        );

        return;
      }

      alert(
        `Appointment moved to ${statusLabels[status]}.`
      );

      await fetchAppointments();
    } catch (error) {
      console.error(
        "Update appointment status error:",
        error
      );

      alert(
        "Something went wrong while updating the appointment status."
      );
    }
  };

  /**
   * ==========================================
   * CANCEL EDIT
   * ==========================================
   */
  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      patientId: "",
      patientName: "",
      phone: "",
      reason: "",
      date: "",
      time: "",
      branchId:
        branches[0]?.id || "",
    });
  };

  /**
   * ==========================================
   * FILTER APPOINTMENTS
   * ==========================================
   */
  const filteredAppointments =
    appointments.filter(
      (appointment) => {
        const searchTerm =
          search.trim().toLowerCase();

        const matchesSearch =
          !searchTerm ||
          appointment.patientName
            .toLowerCase()
            .includes(searchTerm) ||
          appointment.phone
            .toLowerCase()
            .includes(searchTerm) ||
          appointment.reason
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
          !statusFilter ||
          appointment.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 1500,
        margin: "0 auto",
      }}
    >
      {/* ======================================
          PAGE HEADER
      ====================================== */}
      <div
        style={{
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Appointments
        </h1>

        <p
          style={{
            color: "#666",
            margin: 0,
          }}
        >
          Manage patient appointments and
          track the appointment workflow.
        </p>
      </div>

      {/* ======================================
          CREATE / EDIT FORM
      ====================================== */}
      <div
        style={{
          marginBottom: 30,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 24,
          background: "#fff",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 20,
            fontSize: 20,
          }}
        >
          {editingId
            ? "Edit Appointment"
            : "Create Appointment"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {/* PATIENT */}
          <select
            value={form.patientId}
            onChange={(e) =>
              handlePatientChange(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              {patientsLoading
                ? "Loading patients..."
                : "Select Patient"}
            </option>

            {availablePatients.map(
              (patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.fullName}
                  {patient.phone
                    ? ` — ${patient.phone}`
                    : ""}
                </option>
              )
            )}
          </select>

          {/* PHONE */}
          <input
            placeholder="Phone Number"
            value={form.phone}
            readOnly
            style={{
              ...inputStyle,
              background: "#f9fafb",
            }}
          />

          {/* REASON */}
          <input
            placeholder="Reason for Visit"
            value={form.reason}
            onChange={(e) =>
              setForm({
                ...form,
                reason:
                  e.target.value,
              })
            }
            style={inputStyle}
          />

          {/* DATE */}
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            style={inputStyle}
          />

          {/* TIME */}
          <input
            type="time"
            value={form.time}
            onChange={(e) =>
              setForm({
                ...form,
                time: e.target.value,
              })
            }
            style={inputStyle}
          />

          {/* BRANCH */}
          <select
            value={form.branchId}
            onChange={(e) => {
              const branchId =
                e.target.value;

              setForm((prev) => ({
                ...prev,
                branchId,
                patientId: "",
                patientName: "",
                phone: "",
              }));
            }}
            style={inputStyle}
          >
            <option value="">
              Select Branch
            </option>

            {branches.map(
              (branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* SELECTED PATIENT INFORMATION */}
        {form.patientId && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 8,
              background: "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              color: "#166534",
              fontSize: 14,
            }}
          >
            Selected patient:{" "}
            <strong>
              {form.patientName}
            </strong>
          </div>
        )}

        {!patientsLoading &&
          patients.length === 0 && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 8,
                background: "#fff7ed",
                border:
                  "1px solid #fed7aa",
                color: "#9a3412",
                fontSize: 14,
              }}
            >
              No registered patients were
              found. Please create a patient
              first before creating an
              appointment.
            </div>
          )}

        {!patientsLoading &&
          patients.length > 0 &&
          availablePatients.length ===
            0 && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 8,
                background: "#fff7ed",
                border:
                  "1px solid #fed7aa",
                color: "#9a3412",
                fontSize: 14,
              }}
            >
              No patients are available for
              the selected branch.
            </div>
          )}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 18,
          }}
        >
          {editingId ? (
            <>
              <button
                onClick={
                  updateAppointment
                }
                style={
                  primaryButtonStyle
                }
              >
                Update Appointment
              </button>

              <button
                onClick={cancelEdit}
                style={
                  secondaryButtonStyle
                }
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={
                createAppointment
              }
              style={
                primaryButtonStyle
              }
            >
              Create Appointment
            </button>
          )}
        </div>
      </div>

      {/* ======================================
          SEARCH + FILTER
      ====================================== */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search patient, phone or reason..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            ...inputStyle,
            minWidth: 280,
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="">
            All Statuses
          </option>

          <option value="PENDING_RECEPTION_CONFIRMATION">
            Pending Reception
          </option>

          <option value="RECEPTION_CONFIRMED">
            Reception Confirmed
          </option>

          <option value="PATIENT_CONFIRMED">
            Patient Confirmed
          </option>

          <option value="CHECKED_IN">
            Checked In
          </option>

          <option value="IN_CONSULTATION">
            In Consultation
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>

          <option value="MISSED">
            Missed
          </option>

          <option value="RESCHEDULED">
            Rescheduled
          </option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
          }}
          style={
            secondaryButtonStyle
          }
        >
          Clear Filters
        </button>
      </div>

      {/* ======================================
          APPOINTMENT COUNT
      ====================================== */}
      <div
        style={{
          marginBottom: 14,
          color: "#555",
          fontSize: 14,
        }}
      >
        Showing{" "}
        <strong>
          {filteredAppointments.length}
        </strong>{" "}
        of{" "}
        <strong>
          {appointments.length}
        </strong>{" "}
        appointments
      </div>

      {/* ======================================
          LIST
      ====================================== */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottom:
              "1px solid #ddd",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 20,
            }}
          >
            All Appointments
          </h3>
        </div>

        {loading ? (
          <div
            style={{
              padding: 30,
              textAlign: "center",
            }}
          >
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length ===
          0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#666",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 16,
              }}
            >
              No appointments found.
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth: 1100,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Patient
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Phone
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Reason
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Date
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Time
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Branch
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Status
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map(
                  (appointment) => {
                    const nextStatuses =
                      allowedTransitions[
                        appointment.status
                      ] || [];

                    const statusStyle =
                      getStatusStyle(
                        appointment.status
                      );

                    return (
                      <tr
                        key={
                          appointment.id
                        }
                      >
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <strong>
                            {
                              appointment.patientName
                            }
                          </strong>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            appointment.phone
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            appointment.reason
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            appointment.date
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            appointment.time
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            appointment
                              .branch
                              ?.name || "-"
                          }
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "6px 10px",
                              borderRadius:
                                999,
                              fontSize: 12,
                              fontWeight: 600,
                              background:
                                statusStyle.background,
                              color:
                                statusStyle.color,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              statusLabels[
                                appointment
                                  .status
                              ]
                            }
                          </span>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              gap: 8,
                              flexWrap:
                                "wrap",
                              alignItems:
                                "center",
                            }}
                          >
                            <button
                              onClick={() =>
                                startEdit(
                                  appointment
                                )
                              }
                              style={
                                secondaryButtonStyle
                              }
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                deleteAppointment(
                                  appointment.id
                                )
                              }
                              style={
                                dangerButtonStyle
                              }
                            >
                              Delete
                            </button>

                            {nextStatuses.length >
                              0 && (
                              <select
                                defaultValue=""
                                onChange={(
                                  e
                                ) => {
                                  const nextStatus =
                                    e.target
                                      .value as AppointmentStatus;

                                  if (
                                    !nextStatus
                                  ) {
                                    return;
                                  }

                                  updateAppointmentStatus(
                                    appointment.id,
                                    nextStatus
                                  );

                                  e.target.value =
                                    "";
                                }}
                                style={{
                                  ...inputStyle,
                                  minWidth: 180,
                                  padding:
                                    "8px 10px",
                                }}
                              >
                                <option value="">
                                  Change Status
                                </option>

                                {nextStatuses.map(
                                  (
                                    nextStatus
                                  ) => (
                                    <option
                                      key={
                                        nextStatus
                                      }
                                      value={
                                        nextStatus
                                      }
                                    >
                                      {
                                        statusLabels[
                                          nextStatus
                                        ]
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            )}

                            {nextStatuses.length ===
                              0 && (
                              <span
                                style={{
                                  fontSize: 12,
                                  color:
                                    "#888",
                                }}
                              >
                                No further
                                actions
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ==========================================
 * STYLES
 * ==========================================
 */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#111827",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "11px 18px",
  border: "none",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 15px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#374151",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 15px",
  border: "1px solid #fecaca",
  borderRadius: 8,
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

const tableHeaderStyle: React.CSSProperties = {
  padding: "13px 14px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  background: "#f9fafb",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
};

const tableCellStyle: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #eee",
  verticalAlign: "middle",
  fontSize: 14,
  color: "#374151",
};

