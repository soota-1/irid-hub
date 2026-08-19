import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventDTO } from "@/shared/types/api";
import { EVENT_CATEGORY_META } from "@/shared/lib/eventCategory";
import { RSVP_STATUS_META, type RsvpStatus } from "@/shared/lib/rsvpStatus";
import { useDateLocale } from "@/shared/hooks/useDateLocale";
import { TiltCard } from "./TiltCard";
import { LazyImage } from "./LazyImage";
import { cn } from "@/shared/lib/cn";

interface EventCardProps {
  event: EventDTO;
  rsvpStatus?: RsvpStatus | null;
  onClick?: () => void;
  className?: string;
}

/** Rest state: neutral border, no shadow. Hover: violet→magenta glow (the
 * Events identity color, Design.md §2). Category/status labels are
 * resolved via i18n `events:category.*`/`events:rsvp.*` here rather than
 * from EVENT_CATEGORY_META/RSVP_STATUS_META's own `.label` — those two
 * lib files are also read by the (Indonesian-only, out of i18n scope)
 * admin panel, so their `.label` stays plain Indonesian text; only
 * `.textClass`/`.colorVar` are reused from them. */
export function EventCard({ event, rsvpStatus, onClick, className }: EventCardProps) {
  const { t } = useTranslation("events");
  const dateLocale = useDateLocale();
  const category = EVENT_CATEGORY_META[event.category];
  const status = rsvpStatus ? RSVP_STATUS_META[rsvpStatus] : null;
  const start = new Date(event.start_at);

  return (
    <TiltCard glowColor="oklch(62% .22 295 / 0.28)" className={cn("overflow-hidden text-left", className)}>
      <button type="button" onClick={onClick} className="flex h-full w-full flex-col text-left">
        <LazyImage
          src={event.cover_image_url ?? undefined}
          alt={event.title}
          wrapperClassName="aspect-[16/10] w-full"
        />
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-xs font-semibold uppercase tracking-wide", category.textClass)}>
              {t(`category.${event.category}`)}
            </span>
            {status && rsvpStatus && (
              <span className={cn("text-xs font-semibold", status.textClass)}>{t(`rsvp.${rsvpStatus}`)}</span>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug">{event.title}</h3>
          <div className="mt-auto flex flex-col gap-1 pt-2 text-sm text-muted-foreground">
            <span>{format(start, "d MMMM yyyy · HH:mm", { locale: dateLocale })}</span>
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </button>
    </TiltCard>
  );
}
