import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { Languages, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/shared/lib/cn";
import { useTheme } from "@/app/providers";
import { useLanguage } from "@/shared/hooks/useLanguage";

function useNavLinks() {
  const { t } = useTranslation("common");
  return [
    { to: "/jadwal", label: t("nav.kelas") },
    { to: "/events", label: t("nav.events") },
    { to: "/galeri", label: t("nav.galeri") },
    { to: "/prestasi", label: t("nav.prestasi") },
    { to: "/profil", label: t("nav.komunitas") },
    { to: "/pengumuman", label: t("nav.pengumuman") },
  ];
}

function NavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const links = useNavLinks();
  return (
    <nav className={cn("flex items-center gap-6", className)}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-foreground",
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation("common");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="h-3 w-3 rounded-[4px] bg-iridescent" aria-hidden />
          IRIDESCENT
        </Link>

        <NavLinks className="hidden lg:flex" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? t("themeToggle.toLight") : t("themeToggle.toDark")}
            onClick={toggleTheme}
            className="hidden sm:inline-flex"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label={language === "id" ? t("languageToggle.toEnglish") : t("languageToggle.toIndonesian")}
            onClick={toggleLanguage}
            className="hidden gap-1.5 sm:inline-flex"
          >
            <Languages className="h-4 w-4" />
            {language === "id" ? "EN" : "ID"}
          </Button>

          <SignedOut>
            <Button variant="gradient" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/gabung">{t("joinCommunity")}</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("openMenu")}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72">
          <SheetTitle className="sr-only">{t("navMenuTitle")}</SheetTitle>
          <NavLinks className="mt-8 flex-col items-start gap-5" onNavigate={() => setMobileOpen(false)} />

          <Button
            variant="outline"
            size="sm"
            aria-label={language === "id" ? t("languageToggle.toEnglish") : t("languageToggle.toIndonesian")}
            onClick={toggleLanguage}
            className="mt-6 gap-1.5"
          >
            <Languages className="h-4 w-4" />
            {language === "id" ? "English" : "Bahasa Indonesia"}
          </Button>

          <SignedOut>
            <Button variant="gradient" asChild className="mt-3 w-full" onClick={() => setMobileOpen(false)}>
              <Link to="/gabung">{t("joinCommunity")}</Link>
            </Button>
          </SignedOut>
        </SheetContent>
      </Sheet>
    </header>
  );
}
