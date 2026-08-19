import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { KickerLabel, EventCard, StaggerReveal } from "@/shared/components";
import { useEvents } from "../api/useEvents";
import { EventCalendar } from "./EventCalendar";
import { EventDetailPanel } from "./EventDetailPanel";
import type { EventDTO } from "../types";

export function EventsPage() {
  const { data, isLoading } = useEvents({ perPage: 100 });
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const { t } = useTranslation("events");

  const events = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <KickerLabel>{t("kicker")}</KickerLabel>
      <h1 className="mt-3 font-display text-h1">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-muted-foreground">{t("subtitle")}</p>

      <Tabs defaultValue="list" className="mt-10">
        <TabsList>
          <TabsTrigger value="list">{t("tabs.list")}</TabsTrigger>
          <TabsTrigger value="calendar">{t("tabs.calendar")}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-lg" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t("empty")}</p>
          ) : (
            <StaggerReveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => setSelected(event)} />
              ))}
            </StaggerReveal>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <EventCalendar events={events} onSelectEvent={setSelected} />
        </TabsContent>
      </Tabs>

      <EventDetailPanel event={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
