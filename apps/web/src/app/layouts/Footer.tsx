import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-display text-base font-semibold">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-iridescent" aria-hidden />
          IRIDESCENT
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/profil" className="hover:text-foreground">{t("nav.komunitas")}</Link>
          <Link to="/events" className="hover:text-foreground">{t("nav.events")}</Link>
          <Link to="/jadwal" className="hover:text-foreground">{t("nav.kelas")}</Link>
          <Link to="/galeri" className="hover:text-foreground">{t("nav.galeri")}</Link>
          <Link to="/gabung" className="hover:text-foreground">{t("joinCommunity")}</Link>
        </nav>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          aria-label={t("footer.instagramAria")}
          className="text-muted-foreground hover:text-foreground"
        >
          <Instagram className="h-5 w-5" />
        </a>
      </div>
      <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}
