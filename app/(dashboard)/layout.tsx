import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="app-shell flex">
      <Sidebar />

      <section className="flex-1 p-4 pt-20 md:p-6 lg:p-8">
        {children}
      </section>
    </main>
  );
}