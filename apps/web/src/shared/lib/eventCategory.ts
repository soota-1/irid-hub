import type { EventDTO } from "@/shared/types/api";

/** Backend enum is `training | competition | social | other`
 * (Schema.md §2.5) — mapped to display label + identity color. Not the
 * "Showcase/Workshop/Battle" wording from the lovable.app reference,
 * which isn't backed by this schema (see plan's content-reconciliation
 * note). */
export const EVENT_CATEGORY_META: Record<
  EventDTO["category"],
  { label: string; colorVar: string; textClass: string }
> = {
  training: { label: "Latihan", colorVar: "var(--iri-cyan)", textClass: "text-iri-cyan" },
  competition: { label: "Kompetisi", colorVar: "var(--iri-amber)", textClass: "text-iri-amber" },
  social: { label: "Sosial", colorVar: "var(--iri-magenta)", textClass: "text-iri-magenta" },
  other: { label: "Lainnya", colorVar: "var(--muted-foreground)", textClass: "text-muted-foreground" },
};

export const EVENT_CATEGORY_OPTIONS = Object.entries(EVENT_CATEGORY_META).map(([value, meta]) => ({
  value: value as EventDTO["category"],
  label: meta.label,
}));
