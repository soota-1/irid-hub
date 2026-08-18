import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Card, Skeleton, StaggerReveal, StaggerItem } from "@/shared/components";
import { useAchievements } from "../api/useAchievements";
import { AchievementBadge } from "./AchievementBadge";

export function AchievementsPage() {
  const { data, isPending, isError } = useAchievements();
  const achievements = data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-h1">Prestasi</h1>
      <p className="text-surface-muted mt-1">Pencapaian komunitas & member yang membanggakan.</p>

      {isError && <p className="text-danger mt-8">Gagal memuat prestasi.</p>}

      {isPending && (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {!isPending && achievements.length === 0 && !isError && (
        <p className="text-surface-muted mt-8">Belum ada prestasi yang tercatat.</p>
      )}

      <StaggerReveal className="mt-8 grid sm:grid-cols-2 gap-4">
        {achievements.map((a) => (
          <StaggerItem key={a.id}>
            <Card accent="achievements" className="p-5 flex gap-4 items-start h-full">
              <AchievementBadge size={56} />
              <div>
                <h3 className="text-h3">{a.title}</h3>
                {a.achieved_at && (
                  <p className="text-caption text-surface-muted mt-1">
                    {format(new Date(a.achieved_at), "d MMMM yyyy", { locale: idLocale })}
                  </p>
                )}
                {a.description && <p className="text-surface-muted mt-2 text-sm">{a.description}</p>}
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </div>
  );
}
