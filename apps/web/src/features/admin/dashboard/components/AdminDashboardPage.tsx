import { Users, Clock4, CalendarCheck } from "lucide-react";
import { Skeleton, AdminAccessDenied } from "@/shared/components";
import { useDashboardSummary } from "../api/useDashboardSummary";
import { ApiClientError } from "@/shared/lib/apiClient";

export function AdminDashboardPage() {
  const { data, isPending, isError, error } = useDashboardSummary();

  if (isError && error instanceof ApiClientError && error.status === 403) {
    return <AdminAccessDenied />;
  }

  return (
    <div>
      <h1 className="text-h2 mb-6">Dashboard</h1>

      {isError && <p className="text-danger">Gagal memuat ringkasan dashboard.</p>}

      <div className="grid sm:grid-cols-3 gap-4">
        {isPending ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard icon={Users} label="Member Aktif" value={data?.active_member_count ?? 0} />
            <StatCard
              icon={Clock4}
              label="Pendaftaran Pending"
              value={data?.pending_applications ?? 0}
              accent="warning"
            />
            <StatCard icon={CalendarCheck} label="Event Mendatang" value={data?.upcoming_event_count ?? 0} />
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  accent?: "warning";
}) {
  return (
    <div className="rounded-md border border-neutral-200 bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-caption text-surface-muted">{label}</p>
        <Icon size={18} className={accent === "warning" ? "text-warning" : "text-surface-muted"} />
      </div>
      <p className={`text-3xl font-display font-bold mt-2 ${accent === "warning" ? "text-warning" : "text-surface"}`}>
        {value}
      </p>
    </div>
  );
}
