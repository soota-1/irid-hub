import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { Card, TiltCard } from "@/shared/components";
import { categoryColor, categoryLabel, type EventItem } from "../types";

export function EventCard({ event, onClick }: { event: EventItem; onClick: () => void }) {
  const category = (event.category ?? "other") as keyof typeof categoryColor;

  return (
    <TiltCard>
      <button onClick={onClick} className="text-left w-full">
        <Card accent="events" className="p-5 h-full">
          <div className="flex items-center gap-2 mb-3">
            <span className={`h-2 w-2 rounded-full ${categoryColor[category]}`} aria-hidden="true" />
            <span className="text-caption text-surface-muted">{categoryLabel[category]}</span>
          </div>
          <h3 className="text-h3 line-clamp-2">{event.title}</h3>
          {event.start_at && (
            <p className="text-sm text-surface-muted mt-2">
              {format(new Date(event.start_at), "EEEE, d MMMM yyyy · HH:mm", { locale: idLocale })}
            </p>
          )}
          {event.location && (
            <p className="text-sm text-surface-muted mt-1 flex items-center gap-1.5">
              <MapPin size={14} />
              {event.location}
            </p>
          )}
        </Card>
      </button>
    </TiltCard>
  );
}
