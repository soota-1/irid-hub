import { useMemo, useState } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { CalendarDays, List } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Skeleton, StaggerReveal, StaggerItem } from "@/shared/components";
import { useEvents } from "../api/useEvents";
import { EventCalendar } from "./EventCalendar";
import { EventCard } from "./EventCard";
import { EventDetailPanel } from "./EventDetailPanel";
import type { EventItem } from "../types";

type ViewMode = "calendar" | "list";

export function EventsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [range, setRange] = useState(() => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }));
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const params = useMemo(
    () => (view === "calendar" ? { from: range.from.toISOString(), to: range.to.toISOString() } : {}),
    [view, range],
  );
  const { data, isPending, isError } = useEvents(params);
  const events = data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1">Kalender Event</h1>
          <p className="text-surface-muted mt-1">Jangan sampai ketinggalan kegiatan komunitas.</p>
        </div>
        <div className="flex rounded-md border border-neutral-200 p-1" role="tablist" aria-label="Tampilan event">
          <button
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            className={cn(
              "h-9 px-3 rounded text-sm font-medium flex items-center gap-1.5 transition-colors",
              view === "list" ? "bg-iri-violet text-white" : "text-surface-muted",
            )}
          >
            <List size={16} /> List
          </button>
          <button
            role="tab"
            aria-selected={view === "calendar"}
            onClick={() => setView("calendar")}
            className={cn(
              "h-9 px-3 rounded text-sm font-medium flex items-center gap-1.5 transition-colors",
              view === "calendar" ? "bg-iri-violet text-white" : "text-surface-muted",
            )}
          >
            <CalendarDays size={16} /> Kalender
          </button>
        </div>
      </div>

      {isError && <p className="text-danger">Gagal memuat event. Coba muat ulang halaman.</p>}

      {isPending && (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isPending && view === "list" && (
        <>
          {events.length === 0 ? (
            <p className="text-surface-muted">Belum ada event mendatang.</p>
          ) : (
            <StaggerReveal className="grid sm:grid-cols-2 gap-4">
              {events.map((event) => (
                <StaggerItem key={event.id}>
                  <EventCard event={event} onClick={() => setSelectedEvent(event)} />
                </StaggerItem>
              ))}
            </StaggerReveal>
          )}
        </>
      )}

      {!isPending && view === "calendar" && (
        <EventCalendar
          events={events}
          onSelectEvent={setSelectedEvent}
          onMonthChange={(month) => setRange({ from: startOfMonth(month), to: endOfMonth(month) })}
        />
      )}

      <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
