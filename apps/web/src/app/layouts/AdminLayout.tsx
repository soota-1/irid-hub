import { NavLink, Outlet, Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Megaphone,
  Images,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/events", label: "Event", icon: CalendarDays },
  { to: "/admin/schedules", label: "Jadwal Latihan", icon: Clock },
  { to: "/admin/announcements", label: "Pengumuman", icon: Megaphone },
  { to: "/admin/gallery", label: "Galeri", icon: Images },
  { to: "/admin/achievements", label: "Prestasi", icon: Trophy },
  { to: "/admin/members", label: "Member", icon: Users },
];

/** Admin shell — fixed sidebar, neutral-dominant surface with color
 * reserved for accents only, per Design.md §7.5/§8. */
export function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-neutral-200 bg-surface">
        <Link to="/" className="h-16 flex items-center px-6 font-display font-bold text-lg">
          <span className="bg-iridescent bg-clip-text text-transparent">Iridescent</span>
          <span className="ml-1.5 text-xs font-body font-medium text-surface-muted">Admin</span>
        </Link>
        <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Navigasi admin">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-iri-violet/10 text-iri-violet" : "text-surface-muted hover:bg-neutral-200/60 hover:text-surface",
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-200 bg-surface flex items-center justify-end px-6 gap-3">
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
