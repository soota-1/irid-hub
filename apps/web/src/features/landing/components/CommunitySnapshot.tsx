import { useTranslation } from "react-i18next";
import { useEvents } from "@/features/events";
import { useSchedules } from "@/features/schedules";

/** Typography + whitespace instead of generic stat cards (uiux.md §6).
 * Events/Classes counts are real (from the API); Members/Dance Styles are
 * editorial community-provided copy — there's no public member-count
 * endpoint or a "dance style" field anywhere in the schema, so those two
 * stay static rather than being computed from data that doesn't exist. */
export function CommunitySnapshot() {
  const { data: eventsData } = useEvents({ perPage: 1 });
  const { data: schedules } = useSchedules();
  const { t } = useTranslation("landing");

  const stats = [
    { label: t("snapshot.members"), value: "500+" },
    { label: t("snapshot.classes"), value: schedules ? `${schedules.length}+` : "20+" },
    { label: t("snapshot.events"), value: eventsData?.meta ? `${eventsData.meta.total}+` : "15+" },
    { label: t("snapshot.danceStyles"), value: "8" },
  ];

  return (
    <section className="border-y border-border">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-3xl font-bold sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
