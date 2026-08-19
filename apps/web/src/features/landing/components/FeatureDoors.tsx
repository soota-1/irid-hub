import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KickerLabel, TiltCard } from "@/shared/components";
import { cn } from "@/shared/lib/cn";

const DOORS = [
  { to: "/jadwal", key: "classes", glow: "oklch(79% .13 205 / 0.28)", span: "lg:col-span-3" },
  { to: "/events", key: "events", glow: "oklch(62% .22 295 / 0.28)", span: "lg:col-span-2" },
  { to: "/profil", key: "community", glow: "oklch(65% .24 350 / 0.28)", span: "lg:col-span-2" },
  { to: "/prestasi", key: "achievements", glow: "oklch(83% .16 84 / 0.28)", span: "lg:col-span-3" },
] as const;

/** Asymmetrical editorial grid, not a repetitive 3-column layout
 * (uiux.md §6 / §23 anti-slop rules). */
export function FeatureDoors() {
  const { t } = useTranslation("landing");

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <KickerLabel>{t("doors.kicker")}</KickerLabel>
      <h2 className="mt-3 font-display text-h2">{t("doors.title")}</h2>
      <p className="mt-3 max-w-xl text-muted-foreground">{t("doors.subtitle")}</p>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-5">
        {DOORS.map((door) => (
          <TiltCard key={door.to} glowColor={door.glow} className={cn("p-6", door.span)}>
            <Link to={door.to} className="flex h-full flex-col justify-between gap-8">
              <div className="flex items-start justify-between">
                <h3 className="font-display text-h3">{t(`doors.${door.key}.title`)}</h3>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t(`doors.${door.key}.description`)}</p>
            </Link>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
