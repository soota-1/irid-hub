import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import {
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Medal,
  Users,
  Clock,
} from "lucide-react";
import { AdminAccessDenied } from "@/shared/components";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/cn";
import { useDashboardSummary } from "@/features/admin/dashboard/api/useDashboardSummary";

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/schedules", label: "Jadwal", icon: Clock },
  { to: "/admin/announcements", label: "Pengumuman", icon: Megaphone },
  { to: "/admin/gallery", label: "Galeri", icon: ImageIcon },
  { to: "/admin/achievements", label: "Prestasi", icon: Medal },
  { to: "/admin/members", label: "Member", icon: Users },
];

/** Gated by a probe query to /admin/dashboard/summary (officer-level) —
 * there's no dedicated "my role" endpoint in the API contract, so any
 * error from this call (401 not-synced, 403 not-admin, or the request
 * failing outright) is how the UI learns it can't show the admin shell.
 * Previously only 401/403 were handled here and anything else (network
 * failure, CORS block, backend down) fell through to rendering the full
 * sidebar + Outlet with no data and no error shown anywhere — every admin
 * page just looked silently empty instead of explaining what broke. */
export function AdminLayout() {
  const { isLoading, isError, error, refetch } = useDashboardSummary();
  const { signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return <AdminAccessDenied error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/40 sm:flex">
        <div className="flex items-center gap-2 px-5 py-5 font-display text-sm font-semibold">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-iridescent" aria-hidden />
          ADMIN
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {ADMIN_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  isActive && "bg-secondary text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border px-3 py-3">
          {user && (
            <p className="truncate px-3 pb-2 text-xs text-muted-foreground" title={user.primaryEmailAddress?.emailAddress}>
              {user.primaryEmailAddress?.emailAddress ?? user.fullName}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
