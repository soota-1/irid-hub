import { useTranslation } from "react-i18next";
import { KickerLabel, AchievementBadge, StaggerReveal } from "@/shared/components";
import { useAchievements } from "@/features/achievements";

export function AchievementShowcase() {
  const { data } = useAchievements(4);
  const achievements = data ?? [];
  const { t } = useTranslation("landing");

  if (achievements.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <KickerLabel>{t("achievements.kicker")}</KickerLabel>
      <h2 className="mt-3 font-display text-h2">{t("achievements.title")}</h2>

      <StaggerReveal className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-5">
            <AchievementBadge />
            <h3 className="font-display text-base font-semibold leading-snug">{achievement.title}</h3>
            {achievement.description && <p className="text-sm text-muted-foreground">{achievement.description}</p>}
          </div>
        ))}
      </StaggerReveal>
    </section>
  );
}
