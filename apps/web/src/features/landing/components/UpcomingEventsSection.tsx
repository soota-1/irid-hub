import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KickerLabel, EventCard, StaggerReveal } from "@/shared/components";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/features/events";

export function UpcomingEventsSection() {
  const { data, isLoading } = useEvents({ perPage: 3 });
  const events = data?.items ?? [];
  const navigate = useNavigate();
  const { t } = useTranslation("landing");

  if (!isLoading && events.length === 0) return null;

  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <KickerLabel>{t("upcomingEvents.kicker")}</KickerLabel>
            <h2 className="mt-3 font-display text-h2">{t("upcomingEvents.title")}</h2>
          </div>
          <Link to="/events" className="flex items-center gap-1.5 text-sm font-semibold hover:text-iri-violet">
            {t("upcomingEvents.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-lg" />)
            : null}
        </div>

        {!isLoading && (
          <StaggerReveal className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onClick={() => navigate("/events")} />
            ))}
          </StaggerReveal>
        )}
      </div>
    </section>
  );
}
