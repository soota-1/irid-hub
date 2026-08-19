import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/cn";
import { EVENT_CATEGORY_META } from "@/shared/lib/eventCategory";
import { useDateLocale } from "@/shared/hooks/useDateLocale";
import type { EventDTO } from "@/shared/types/api";

interface EventCalendarProps {
  events: EventDTO[];
  onSelectEvent: (event: EventDTO) => void;
}

/** Month-view grid — Design.md §8, uiux.md §9. Category dots use the same
 * identity colors as EventCard's tag. Selecting an event is handled by the
 * caller (opens the slide-over detail panel). */
export function EventCalendar({ events, onSelectEvent }: EventCalendarProps) {
  const { t } = useTranslation("events");
  const dateLocale = useDateLocale();
  const dayLabels = t("calendar.days", { returnObjects: true }) as string[];
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const leadingBlanks = getDay(start);
    const grid = eachDayOfInterval({ start, end });
    return { leadingBlanks, grid };
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventDTO[]>();
    for (const event of events) {
      const key = format(new Date(event.start_at), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{format(month, "MMMM yyyy", { locale: dateLocale })}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label={t("calendar.prevMonth")} onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t("calendar.nextMonth")} onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
        {dayLabels.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: days.leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.grid.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={key}
              className={cn(
                "flex min-h-16 flex-col gap-1 rounded-md border border-transparent p-1.5 text-left text-xs",
                isSameMonth(day, month) ? "text-foreground" : "text-muted-foreground/40",
                isToday && "border-border bg-secondary/40",
              )}
            >
              <span className="font-medium">{format(day, "d")}</span>
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-left hover:bg-secondary"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: EVENT_CATEGORY_META[event.category].colorVar }}
                    />
                    <span className="truncate">{event.title}</span>
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <span className="px-1 text-muted-foreground">{t("calendar.moreCount", { count: dayEvents.length - 2 })}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
