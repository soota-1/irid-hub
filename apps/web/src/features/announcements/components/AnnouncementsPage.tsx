import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { KickerLabel, AnnouncementBanner, StaggerReveal } from "@/shared/components";
import { useAnnouncements } from "../api/useAnnouncements";

export function AnnouncementsPage() {
  const { data, isLoading } = useAnnouncements();
  const { t } = useTranslation("announcements");

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <KickerLabel>{t("kicker")}</KickerLabel>
      <h1 className="mt-3 font-display text-h1">{t("title")}</h1>
      <p className="mt-3 text-body-lg text-muted-foreground">{t("subtitle")}</p>

      {isLoading && (
        <div className="mt-10 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{t("empty")}</p>
      )}

      {!isLoading && (data?.length ?? 0) > 0 && (
        <StaggerReveal className="mt-10 flex flex-col gap-4">
          {data!.map((announcement) => (
            <AnnouncementBanner key={announcement.id} announcement={announcement} />
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
