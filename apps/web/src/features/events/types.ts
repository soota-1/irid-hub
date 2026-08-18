import type { components } from "@irid-hub/shared-types";

export type EventItem = components["schemas"]["handler.eventDTO"];
export type EventCategory = "training" | "competition" | "social" | "other";

export const categoryColor: Record<EventCategory, string> = {
  training: "bg-iri-cyan",
  competition: "bg-iri-amber",
  social: "bg-iri-magenta",
  other: "bg-iri-azure",
};

export const categoryLabel: Record<EventCategory, string> = {
  training: "Latihan",
  competition: "Kompetisi",
  social: "Acara Sosial",
  other: "Lainnya",
};
