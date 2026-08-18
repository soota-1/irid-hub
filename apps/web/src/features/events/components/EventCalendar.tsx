import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { categoryColor, type EventItem } from "../types";

const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function EventCalendar({
  events,
  onSelectEvent,
  onMonthChange,
}: {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onMonthChange: (month: Date) => void;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const event of events) {
      if (!event.start_at) continue;
      const key = format(new Date(event.start_at), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  function changeMonth(next: Date) {
    setMonth(next);
    onMonthChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h3 capitalize">{format(month, "MMMM yyyy", { locale: idLocale })}</h2>
        <div className="flex gap-1">
          <button
            aria-label="Bulan sebelumnya"
            onClick={() => changeMonth(subMonths(month, 1))}
            className="h-9 w-9 flex items-center justify-center rounded-md border border-neutral-200 hover:border-iri-violet transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            aria-label="Bulan berikutnya"
            onClick={() => changeMonth(addMonths(month, 1))}
            className="h-9 w-9 flex items-center justify-center rounded-md border border-neutral-200 hover:border-iri-violet transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekdayLabels.map((d) => (
          <div key={d} className="text-caption text-surface-muted py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={key}
              className={cn(
                "min-h-20 rounded-md border p-1.5 text-left",
                inMonth ? "border-neutral-200" : "border-transparent",
                isToday && "border-iri-violet",
              )}
            >
              <span className={cn("text-xs", inMonth ? "text-surface" : "text-surface-muted/40")}>{format(day, "d")}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {dayEvents.slice(0, 4).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    aria-label={event.title ?? undefined}
                    title={event.title ?? undefined}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      categoryColor[(event.category ?? "other") as keyof typeof categoryColor],
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
