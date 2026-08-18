import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/shared/lib/cn";
import { urgencyAccent, urgencyLabel, type Announcement } from "../types";

/** Design.md §7.3: accent bar on the left, color driven by urgency. */
export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  const urgency = announcement.urgency ?? "info";

  return (
    <div className={cn("rounded-md border-l-4 bg-surface border border-neutral-200 p-5", urgencyAccent[urgency])}>
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <span className="text-caption font-semibold uppercase tracking-wide text-surface-muted">
          {urgencyLabel[urgency]}
        </span>
        {announcement.published_at && (
          <span className="text-caption text-surface-muted">
            {format(new Date(announcement.published_at), "d MMM yyyy", { locale: idLocale })}
          </span>
        )}
      </div>
      <h3 className="text-h3">{announcement.title}</h3>
      <p className="text-surface-muted mt-1.5 whitespace-pre-line">{announcement.content}</p>
    </div>
  );
}
