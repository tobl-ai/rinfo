interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
}

export function KpiCard({ title, value, subtitle, icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-rinfo-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <p className="text-sm font-medium text-rinfo-700">{title}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-rinfo-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-sm text-rinfo-500">{subtitle}</p>
      )}
    </div>
  );
}
