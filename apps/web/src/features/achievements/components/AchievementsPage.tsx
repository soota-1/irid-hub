import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { KickerLabel, AchievementBadge, StaggerReveal } from "@/shared/components";
import { useDateLocale } from "@/shared/hooks/useDateLocale";
import { useAchievements } from "../api/useAchievements";

/** Achievements identity: Amber → Coral (Design.md §2, uiux.md §6 Achievement Showcase). */
export function AchievementsPage() {
  const { data, isLoading } = useAchievements();
  const { t } = useTranslation("achievements");
  const dateLocale = useDateLocale();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <KickerLabel>{t("kicker")}</KickerLabel>
      <h1 className="mt-3 font-display text-h1 bg-iri-achievements bg-clip-text text-transparent">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">{t("subtitle")}</p>

      {isLoading && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{t("empty")}</p>
      )}

      {!isLoading && (data?.length ?? 0) > 0 && (
        <StaggerReveal className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((achievement) => (
            <div key={achievement.id} className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
              <AchievementBadge />
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold leading-snug">{achievement.title}</h3>
                {achievement.achieved_at && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format(new Date(achievement.achieved_at), "MMMM yyyy", { locale: dateLocale })}
                  </p>
                )}
                {achievement.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{achievement.description}</p>
                )}
              </div>
            </div>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
