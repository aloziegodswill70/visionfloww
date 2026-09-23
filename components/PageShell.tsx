interface PageShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function PageShell({
  title,
  subtitle,
  children,
}: PageShellProps) {
  return (
    <>
      <div className="card card-padding mb-6">
        <h2 className="dashboard-title">{title}</h2>
        <p className="dashboard-subtitle">{subtitle}</p>
      </div>

      {children}
    </>
  );
}