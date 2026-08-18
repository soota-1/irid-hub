import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

const navLinks = [
  { to: "/", label: "Beranda" },
  { to: "/profil", label: "Profil" },
  { to: "/events", label: "Event" },
  { to: "/jadwal", label: "Jadwal" },
  { to: "/pengumuman", label: "Pengumuman" },
  { to: "/galeri", label: "Galeri" },
  { to: "/prestasi", label: "Prestasi" },
];

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-display font-bold">
            <span className="bg-iridescent bg-clip-text text-transparent">Iridescent</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "text-iri-violet" : "text-surface-muted hover:text-surface",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-surface-muted hover:text-surface transition-colors">
                  Masuk
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/akun" className="text-sm font-medium text-surface-muted hover:text-surface transition-colors">
                Akun Saya
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <Link
              to="/gabung"
              className="inline-flex items-center justify-center h-9 px-3.5 rounded-md text-sm font-medium text-white bg-iridescent bg-[length:200%_100%] bg-left hover:bg-right shadow-[0_12px_24px_-8px_rgba(139,92,246,0.45)] transition-[background-position,box-shadow] duration-300"
            >
              Gabung Komunitas
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-surface"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden border-t border-neutral-200 px-4 py-3 flex flex-col gap-1" aria-label="Navigasi mobile">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2.5 rounded-md text-sm font-medium",
                    isActive ? "text-iri-violet bg-iri-violet/5" : "text-surface-muted",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="border-t border-neutral-200 mt-2 pt-3 flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-surface-muted">Masuk</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/akun" className="text-sm font-medium text-surface-muted">
                  Akun Saya
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-muted">
            © {new Date().getFullYear()} Iridescent. Dibuat dengan ❤ untuk komunitas.
          </p>
          <div className="flex items-center gap-4 text-sm text-surface-muted">
            <Link to="/profil" className="hover:text-surface transition-colors">
              Tentang Kami
            </Link>
            <Link to="/gabung" className="hover:text-surface transition-colors">
              Gabung
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
