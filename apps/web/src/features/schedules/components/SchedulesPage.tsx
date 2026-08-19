import { Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { KickerLabel, StaggerReveal } from "@/shared/components";
import { useSchedules } from "../api/useSchedules";

/** Schedule identity: Cyan → Azure (Design.md §2, uiux.md §8). Day names
 * come from i18n (`schedules:days`), not the shared `DAY_NAMES` export in
 * `../types` — that one is also read by the Indonesian-only admin panel
 * and must stay untranslated. */
export function SchedulesPage() {
  const { data, isLoading } = useSchedules();
  const { t } = useTranslation("schedules");
  const dayLabels = t("days", { returnObjects: true }) as string[];

  const byDay = new Map<number, typeof data>();
  for (const schedule of data ?? []) {
    byDay.set(schedule.day_of_week, [...(byDay.get(schedule.day_of_week) ?? []), schedule]);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <KickerLabel>{t("kicker")}</KickerLabel>
      <h1 className="mt-3 font-display text-h1 bg-iri-schedules bg-clip-text text-transparent">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">{t("subtitle")}</p>

      {isLoading && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{t("empty")}</p>
      )}

      {!isLoading && (data?.length ?? 0) > 0 && (
        <StaggerReveal className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) =>
            (byDay.get(dayIndex) ?? []).map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-[0_20px_40px_-12px_oklch(79%_.13_205/0.25)]"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-iri-cyan">
                  {dayLabels[dayIndex]}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold">{schedule.title}</h3>
                <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {schedule.start_time} – {schedule.end_time}
                  </span>
                  {schedule.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {schedule.location}
                    </span>
                  )}
                </div>
              </div>
            )),
          )}
        </StaggerReveal>
      )}
    </div>
  );
}
