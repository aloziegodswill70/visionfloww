import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import AppointmentQueue from "@/components/AppointmentQueue";
import WhatsAppInbox from "@/components/WhatsAppInbox";
import AutomationActions from "@/components/AutomationActions";

import { CalendarCheck, MessageCircle, Users, Glasses } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  /*
   * SUPER_ADMIN does not belong to a clinic.
   * The clinic dashboard therefore only loads for clinic users.
   */
  if (!session?.user?.clinicId) {
    return (
      <main className="app-shell flex">
        <Sidebar />

        <section className="flex-1 p-4 md:p-6 lg:p-8">
          <Topbar />

          <div className="mt-6">
            <div className="card card-padding">
              <h3 className="text-xl font-bold text-slate-950">
                Platform Administration
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                You are signed in as a VisionFlow platform administrator.
                Clinic-specific information is available after selecting a
                clinic.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const clinicId = session.user.clinicId;

  /*
   * Get the authenticated clinic.
   */
  const clinic = await prisma.clinic.findUnique({
    where: {
      id: clinicId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!clinic) {
    return (
      <main className="app-shell flex">
        <Sidebar />

        <section className="flex-1 p-4 md:p-6 lg:p-8">
          <Topbar />

          <div className="mt-6">
            <div className="card card-padding">
              <h3 className="text-xl font-bold text-slate-950">
                Clinic Not Found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your account is not currently associated with a valid clinic.
                Please contact the VisionFlow administrator.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * Fetch real clinic statistics.
   *
   * Every query is explicitly scoped by clinicId.
   */
  const [
    appointmentCount,
    whatsappCount,
    patientCount,
    glassesReadyCount,
    appointments,
    whatsappMessages,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        clinicId,
      },
    }),

    prisma.whatsAppMessage.count({
      where: {
        clinicId,
      },
    }),

    prisma.patient.count({
      where: {
        clinicId,
      },
    }),

    prisma.opticalOrder.count({
      where: {
        clinicId,
        status: "Ready",
      },
    }),

    prisma.appointment.findMany({
      where: {
        clinicId,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      take: 10,
    }),

    prisma.whatsAppMessage.findMany({
      where: {
        clinicId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  return (
    <main className="app-shell flex">
      <Sidebar />

      <section className="flex-1 p-4 md:p-6 lg:p-8">
        <Topbar />

        <div className="mt-6">
          <p className="text-sm text-slate-500">
            Welcome back,{" "}
            <span className="font-semibold text-slate-900">
              {session.user.name}
            </span>
            .
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            {clinic.name}
          </h1>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
          <StatCard
            title="Appointments"
            value={appointmentCount}
            icon={CalendarCheck}
          />

          <StatCard
            title="WhatsApp Chats"
            value={whatsappCount}
            icon={MessageCircle}
          />

          <StatCard
            title="Patients"
            value={patientCount}
            icon={Users}
          />

          <StatCard
            title="Glasses Ready"
            value={glassesReadyCount}
            icon={Glasses}
          />
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-2">
            <AppointmentQueue appointments={appointments} />
          </div>

          <WhatsAppInbox messages={whatsappMessages} />
        </div>

        <AutomationActions />
      </section>
    </main>
  );
}