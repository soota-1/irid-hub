import { Link } from "react-router-dom";
import { useAchievements, AchievementBadge } from "@/features/achievements";
import { Skeleton } from "@/shared/components";

export function AchievementCarousel() {
  const { data, isPending } = useAchievements();
  const achievements = data?.data ?? [];

  if (!isPending && achievements.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-h2">Prestasi Terbaru</h2>
        <Link to="/prestasi" className="text-sm font-medium text-iri-violet hover:underline">
          Lihat semua
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:thin]">
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-64 shrink-0 snap-start" />
          ))}

        {achievements.slice(0, 8).map((a) => (
          <div
            key={a.id}
            className="h-32 w-64 shrink-0 snap-start rounded-lg border border-neutral-200 p-4 flex gap-3 items-center"
          >
            <AchievementBadge size={44} />
            <div className="min-w-0">
              <p className="font-medium text-surface line-clamp-2 text-sm">{a.title}</p>
              {a.achieved_at && <p className="text-caption text-surface-muted mt-1">{a.achieved_at.slice(0, 4)}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
