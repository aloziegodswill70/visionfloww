"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/dashboard/overview");
      const json = await res.json();
      setData(json);
    };

    fetchData();
  }, []);

  if (!data) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard Overview</h1>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Card title="Clinics" value={data.clinicCount} />
        <Card title="Patients" value={data.patientCount} />
        <Card title="Appointments" value={data.appointmentCount} />
        <Card title="Pending" value={data.pendingAppointments} />
      </div>

      <h2 style={{ marginTop: 40 }}>Recent Appointments</h2>

      <div>
        {data.recentAppointments.map((a: any) => (
          <div
            key={a.id}
            style={{
              padding: 10,
              borderBottom: "1px solid #ddd",
            }}
          >
            <strong>{a.patientName}</strong> — {a.date} {a.time}
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 10,
        minWidth: 120,
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: 22 }}>{value}</p>
    </div>
  );
}