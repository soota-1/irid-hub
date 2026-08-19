import { Link } from "react-router-dom";
import { Users, Clock, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "../api/useDashboardSummary";

/** Amber accent on pending applications draws admin attention there —
 * Design.md §8 ("angka pendaftaran pending pakai warna warning/amber"). */
export function AdminDashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  const cards = [
    { label: "Member Aktif", value: data?.active_member_count, icon: Users, to: "/admin/members", accent: "text-foreground" },
    { label: "Aplikasi Pending", value: data?.pending_applications, icon: Clock, to: "/admin/members", accent: "text-warning" },
    { label: "Event Mendatang", value: data?.upcoming_event_count, icon: CalendarDays, to: "/admin/events", accent: "text-foreground" },
  ];

  return (
    <div>
      <h1 className="font-display text-h2">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-secondary/40"
          >
            <card.icon className="h-5 w-5 text-muted-foreground" />
            {isLoading ? (
              <Skeleton className="mt-3 h-9 w-16" />
            ) : (
              <p className={`mt-3 font-display text-3xl font-bold ${card.accent}`}>{card.value ?? 0}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
