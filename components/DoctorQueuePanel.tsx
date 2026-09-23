"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, PlayCircle } from "lucide-react";
import DoctorPatientCard from "@/components/DoctorPatientCard";
import MedicationReminderForm, {
  MedicationFormData,
} from "@/components/MedicationReminderForm";
import FollowUpReminderForm, {
  FollowUpFormData,
} from "@/components/FollowUpReminderForm";
import { useClinicStore } from "@/lib/store/clinic-store";

const defaultMedicationForm: MedicationFormData = {
  enabled: true,
  medicationName: "",
  dosageInstruction: "",
  frequency: "",
  reminderTime: "",
  startDate: "",
  endDate: "",
  extraInstruction: "",
};

const defaultFollowUpForm: FollowUpFormData = {
  enabled: true,
  followUpDate: "",
  followUpTime: "",
  reminderSchedule: "",
  reason: "",
  note: "",
};

export default function DoctorQueuePanel() {
  const appointments = useClinicStore((state) => state.appointments);

  const startConsultation = useClinicStore(
    (state) => state.startConsultation
  );

  const completeConsultation = useClinicStore(
    (state) => state.completeConsultation
  );

  const addMedicationReminder = useClinicStore(
    (state) => state.addMedicationReminder
  );

  const addFollowUpReminder = useClinicStore(
    (state) => state.addFollowUpReminder
  );

  const addExecutionLog = useClinicStore(
    (state) => state.addExecutionLog
  );

  const doctorQueue = appointments.filter(
    (appointment) =>
      appointment.status === "CHECKED_IN" ||
      appointment.status === "IN_CONSULTATION"
  );

  const firstPatientId = doctorQueue[0]?.patientId ?? null;

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    firstPatientId
  );

  const [medicationForm, setMedicationForm] =
    useState<MedicationFormData>(defaultMedicationForm);

  const [followUpForm, setFollowUpForm] =
    useState<FollowUpFormData>(defaultFollowUpForm);

  useEffect(() => {
    if (!selectedPatientId && firstPatientId) {
      setSelectedPatientId(firstPatientId);
    }
  }, [firstPatientId, selectedPatientId]);

  const selectedAppointment = useMemo(() => {
    return doctorQueue.find(
      (appointment) => appointment.patientId === selectedPatientId
    );
  }, [doctorQueue, selectedPatientId]);

  function handleActivateAutomation() {
    if (!selectedAppointment) return;

    if (
      medicationForm.enabled &&
      medicationForm.medicationName &&
      medicationForm.dosageInstruction
    ) {
      addMedicationReminder({
        id: `med_${Date.now()}`,
        clinicId: selectedAppointment.clinicId,
        branchId: selectedAppointment.branchId,
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        medicationName: medicationForm.medicationName,
        dosageInstruction: medicationForm.dosageInstruction,
        frequency: medicationForm.frequency || "Daily",
        reminderTime: medicationForm.reminderTime || "08:00",
        startDate: medicationForm.startDate,
        endDate: medicationForm.endDate,
        status: "SCHEDULED",
      });
    }

    if (
      followUpForm.enabled &&
      followUpForm.followUpDate &&
      followUpForm.followUpTime
    ) {
      addFollowUpReminder({
        id: `followup_${Date.now()}`,
        clinicId: selectedAppointment.clinicId,
        branchId: selectedAppointment.branchId,
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        followUpDate: followUpForm.followUpDate,
        followUpTime: followUpForm.followUpTime,
        reminderSchedule: followUpForm.reminderSchedule
          ? [followUpForm.reminderSchedule]
          : ["2 days before", "12 hours before"],
        reason: followUpForm.reason || "Follow-up review",
        status: "SCHEDULED",
      });
    }

   addExecutionLog({
  id: `exec_${Date.now()}`,
  clinicId: selectedAppointment.clinicId,
  workflowName: "Doctor Consultation Workflow",
  patientName: selectedAppointment.patientName,
  action: "activate_automation",
  status: "success",
  message:
    "Doctor activated medication and follow-up reminder automation.",
  time: "Now",
});

    completeConsultation(selectedAppointment.id);

    setMedicationForm(defaultMedicationForm);
    setFollowUpForm(defaultFollowUpForm);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-950">
            Doctor Queue
          </h3>

          <p className="text-sm text-slate-500">
            Patients queued by reception for consultation workflow.
          </p>
        </div>

        <div className="space-y-4">
          {doctorQueue.map((appointment) => (
            <DoctorPatientCard
              key={appointment.id}
              appointment={appointment}
              isActive={appointment.patientId === selectedPatientId}
              onSelect={() =>
                setSelectedPatientId(appointment.patientId ?? null)
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {selectedAppointment ? (
          <>
            <div className="card card-padding">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-950">
                    {selectedAppointment.patientName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAppointment.reason} •{" "}
                    {selectedAppointment.date} by{" "}
                    {selectedAppointment.time}
                  </p>
                </div>

                <span className="badge-info capitalize">
                  {selectedAppointment.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {selectedAppointment.status === "CHECKED_IN" && (
                  <button
                    onClick={() =>
                      startConsultation(selectedAppointment.id)
                    }
                    className="btn-primary gap-2"
                  >
                    <PlayCircle size={16} />
                    Start Consultation
                  </button>
                )}

                {selectedAppointment.status === "IN_CONSULTATION" && (
                  <button
                    onClick={() =>
                      completeConsultation(selectedAppointment.id)
                    }
                    className="btn-soft gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Mark Consultation Done
                  </button>
                )}
              </div>
            </div>

            <MedicationReminderForm
              value={medicationForm}
              onChange={setMedicationForm}
            />

            <FollowUpReminderForm
              value={followUpForm}
              onChange={setFollowUpForm}
            />

            <div className="card card-padding">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">
                    Complete Doctor Workflow
                  </h3>

                  <p className="text-sm text-slate-500">
                    Save reminders and activate WhatsApp automation for this patient.
                  </p>
                </div>

                <button
                  onClick={handleActivateAutomation}
                  className="btn-whatsapp gap-2"
                >
                  <Bot size={16} />
                  Save & Activate Automation
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 size={16} />
                Follow-up and medication reminders will be scheduled automatically.
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-clinic-blue">
                <Bot size={26} />
              </div>

              <h3 className="text-lg font-bold text-slate-950">
                No patient in doctor queue
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Reception must mark a patient as arrived and queue them for the doctor.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}