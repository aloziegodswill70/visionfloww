import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="card card-padding">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-2 text-slate-950">
            {value.toLocaleString()}
          </h3>
        </div>

        <div className="h-14 w-14 rounded-2xl bg-sky-100 text-clinic-blue flex items-center justify-center">
          <Icon size={26} />
        </div>
      </div>
    </div>
  );
}