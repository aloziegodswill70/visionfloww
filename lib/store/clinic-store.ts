"use client";

import { create } from "zustand";
import {
  appointments as initialAppointments,
  opticalOrders as initialOpticalOrders,
  medicationReminders as initialMedicationReminders,
  followUpReminders as initialFollowUpReminders,
} from "@/lib/data";
import {
  Appointment,
  FollowUpReminder,
  MedicationReminder,
  OpticalOrder,
} from "@/lib/types";

interface ExecutionLog {
  id: string;
  clinicId: string;
  workflowName: string;
  patientName: string;
  action: string;
  status: "success" | "pending" | "failed";
  message: string;
  time: string;
}

interface ClinicStore {
  appointments: Appointment[];
  opticalOrders: OpticalOrder[];
  medicationReminders: MedicationReminder[];
  followUpReminders: FollowUpReminder[];
  executionLogs: ExecutionLog[];

  confirmAppointment: (appointmentId: string) => void;
  markPatientArrived: (appointmentId: string) => void;
  queueForDoctor: (appointmentId: string) => void;
  startConsultation: (appointmentId: string) => void;
  completeConsultation: (appointmentId: string) => void;

  markOpticalReady: (orderId: string) => void;
  markOpticalDelivered: (orderId: string) => void;

  addMedicationReminder: (reminder: MedicationReminder) => void;
  addFollowUpReminder: (reminder: FollowUpReminder) => void;

  addExecutionLog: (log: ExecutionLog) => void;
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const useClinicStore = create<ClinicStore>((set) => ({
  appointments: initialAppointments,
  opticalOrders: initialOpticalOrders,
  medicationReminders: initialMedicationReminders,
  followUpReminders: initialFollowUpReminders,
  executionLogs: [],

  confirmAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: "RECEPTION_CONFIRMED",
              receptionistConfirmed: true,
            }
          : appointment
      ),
    })),

  markPatientArrived: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: "CHECKED_IN",
            }
          : appointment
      ),
    })),

  queueForDoctor: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: "CHECKED_IN",
            }
          : appointment
      ),
    })),

  startConsultation: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: "IN_CONSULTATION",
            }
          : appointment
      ),
    })),

  completeConsultation: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: "COMPLETED",
            }
          : appointment
      ),
    })),

  markOpticalReady: (orderId) =>
    set((state) => {
      const order = state.opticalOrders.find((item) => item.id === orderId);

      return {
        opticalOrders: state.opticalOrders.map((item) =>
          item.id === orderId
            ? {
                ...item,
                status: "Ready",
              }
            : item
        ),

        executionLogs: order
          ? [
              {
                id: `exec_${Date.now()}`,
                clinicId: order.clinicId,
                workflowName: "Glasses Ready Alert",
                patientName: order.patientName,
                action: "send_whatsapp",
                status: "success",
                message: "Glasses pickup reminder queued successfully.",
                time: nowTime(),
              },
              ...state.executionLogs,
            ]
          : state.executionLogs,
      };
    }),

  markOpticalDelivered: (orderId) =>
    set((state) => ({
      opticalOrders: state.opticalOrders.map((item) =>
        item.id === orderId
          ? {
              ...item,
              status: "Delivered",
            }
          : item
      ),
    })),

  addMedicationReminder: (reminder) =>
    set((state) => ({
      medicationReminders: [reminder, ...state.medicationReminders],
      executionLogs: [
        {
          id: `exec_${Date.now()}`,
          clinicId: reminder.clinicId,
          workflowName: "Medication Reminder",
          patientName: reminder.patientName,
          action: "schedule_reminder",
          status: "success",
          message: `Medication reminder scheduled: ${reminder.dosageInstruction}`,
          time: nowTime(),
        },
        ...state.executionLogs,
      ],
    })),

  addFollowUpReminder: (reminder) =>
    set((state) => ({
      followUpReminders: [reminder, ...state.followUpReminders],
      executionLogs: [
        {
          id: `exec_${Date.now()}`,
          clinicId: reminder.clinicId,
          workflowName: "Follow-Up Reminder",
          patientName: reminder.patientName,
          action: "schedule_reminder",
          status: "success",
          message: `Follow-up reminder scheduled for ${reminder.followUpDate} by ${reminder.followUpTime}.`,
          time: nowTime(),
        },
        ...state.executionLogs,
      ],
    })),

  addExecutionLog: (log) =>
    set((state) => ({
      executionLogs: [log, ...state.executionLogs],
    })),
}));