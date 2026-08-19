import { format } from "date-fns";
import { CalendarClock, MapPin } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/shared/components";
import { EVENT_CATEGORY_META } from "@/shared/lib/eventCategory";
import { RSVP_OPTIONS, type RsvpStatus } from "@/shared/lib/rsvpStatus";
import { useDateLocale } from "@/shared/hooks/useDateLocale";
import { useRsvpEvent } from "../api/useEvents";
import type { EventDTO } from "../types";
import { cn } from "@/shared/lib/cn";

interface EventDetailPanelProps {
  event: EventDTO | null;
  onOpenChange: (open: boolean) => void;
}

/** Slide-over detail panel — uiux.md §9: calendar context stays visible
 * behind it (Sheet renders as an overlay panel, not a route change). */
export function EventDetailPanel({ event, onOpenChange }: EventDetailPanelProps) {
  const { t } = useTranslation("events");
  const dateLocale = useDateLocale();
  const rsvp = useRsvpEvent(event?.id ?? "");

  if (!event) return null;
  const category = EVENT_CATEGORY_META[event.category];

  function handleRsvp(status: RsvpStatus) {
    rsvp.mutate(status, {
      onSuccess: () => toast.success(t("detail.rsvpSaved")),
      onError: () => toast.error(t("detail.rsvpFailed")),
    });
  }

  return (
    <Sheet open={Boolean(event)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <span className={cn("text-xs font-semibold uppercase tracking-wide", category.textClass)}>
            {t(`category.${event.category}`)}
          </span>
          <SheetTitle>{event.title}</SheetTitle>
          <SheetDescription className="sr-only">{t("detail.srLabel", { title: event.title })}</SheetDescription>
        </SheetHeader>

        {event.cover_image_url && (
          <LazyImage src={event.cover_image_url} alt={event.title} wrapperClassName="mt-4 aspect-video rounded-md" />
        )}

        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0" />
            {format(new Date(event.start_at), "EEEE, d MMMM yyyy · HH:mm", { locale: dateLocale })}
            {" – "}
            {format(new Date(event.end_at), "HH:mm", { locale: dateLocale })}
          </span>
          {event.location && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {event.location}
            </span>
          )}
        </div>

        {event.description && <p className="mt-4 text-sm leading-relaxed text-foreground">{event.description}</p>}

        <div className="mt-6 border-t border-border pt-6">
          <SignedIn>
            <p className="mb-2 text-sm font-semibold">{t("detail.rsvpTitle")}</p>
            <div className="flex flex-wrap gap-2">
              {RSVP_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant="outline"
                  disabled={rsvp.isPending}
                  onClick={() => handleRsvp(option.value)}
                >
                  {t(`rsvp.options.${option.value}`)}
                </Button>
              ))}
            </div>
          </SignedIn>
          <SignedOut>
            <p className="text-sm text-muted-foreground">{t("detail.signInToRsvp")}</p>
          </SignedOut>
        </div>
      </SheetContent>
    </Sheet>
  );
}
