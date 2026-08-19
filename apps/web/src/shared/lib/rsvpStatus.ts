export type RsvpStatus = "going" | "not_going" | "maybe";

/** Small colored status text on EventCard (Design.md §7) — reflects the
 * signed-in user's own RSVP (`event_rsvps.status`, Schema.md §2.6), not a
 * fabricated "registration open/waitlist" state the schema doesn't have. */
export const RSVP_STATUS_META: Record<RsvpStatus, { label: string; textClass: string }> = {
  going: { label: "Kamu akan hadir", textClass: "text-iri-mint" },
  maybe: { label: "Mungkin hadir", textClass: "text-iri-amber" },
  not_going: { label: "Tidak hadir", textClass: "text-muted-foreground" },
};

export const RSVP_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: "going", label: "Hadir" },
  { value: "maybe", label: "Mungkin" },
  { value: "not_going", label: "Tidak hadir" },
];
