import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { X, MapPin, Calendar } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { categoryColor, categoryLabel, type EventItem } from "../types";
import { useRsvp, type RsvpStatus } from "../api/useEvents";

const rsvpOptions: { value: RsvpStatus; label: string }[] = [
  { value: "going", label: "Hadir" },
  { value: "maybe", label: "Mungkin" },
  { value: "not_going", label: "Tidak Hadir" },
];

/** Design.md §8: clicking a calendar date opens a slide-over, not a page
 * navigation, so calendar context/scroll position isn't lost. */
export function EventDetailPanel({ event, onClose }: { event: EventItem | null; onClose: () => void }) {
  const rsvp = useRsvp(event?.id ?? "");
  const [selected, setSelected] = useState<RsvpStatus | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [event?.id]);

  useEffect(() => {
    if (!event) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [event, onClose]);

  const category = (event?.category ?? "other") as keyof typeof categoryColor;

  return createPortal(
    <AnimatePresence>
      {event && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-neutral-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={event.title ?? undefined}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md h-full bg-surface shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${categoryColor[category]}`} aria-hidden="true" />
                <span className="text-caption text-surface-muted">{categoryLabel[category]}</span>
              </span>
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="rounded-md p-1.5 text-surface-muted hover:text-surface hover:bg-neutral-200/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-h2">{event.title}</h2>

              <div className="mt-4 space-y-2 text-sm text-surface-muted">
                {event.start_at && (
                  <p className="flex items-center gap-2">
                    <Calendar size={16} />
                    {format(new Date(event.start_at), "EEEE, d MMMM yyyy · HH:mm", { locale: idLocale })}
                  </p>
                )}
                {event.location && (
                  <p className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.location}
                  </p>
                )}
              </div>

              {event.description && <p className="mt-6 text-surface whitespace-pre-line">{event.description}</p>}

              <SignedIn>
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <p className="text-caption text-surface-muted mb-3">Konfirmasi kehadiran</p>
                  <div className="flex gap-2">
                    {rsvpOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelected(opt.value);
                          rsvp.mutate(opt.value);
                        }}
                        disabled={rsvp.isPending}
                        className={`flex-1 h-10 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 ${
                          selected === opt.value
                            ? "bg-iri-violet text-white border-iri-violet"
                            : "border-neutral-200 text-surface hover:border-iri-violet"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {rsvp.isSuccess && <p className="text-caption text-success mt-2">Konfirmasi tersimpan.</p>}
                  {rsvp.isError && (
                    <p className="text-caption text-danger mt-2">
                      Gagal menyimpan konfirmasi — pastikan kamu member aktif komunitas ini.
                    </p>
                  )}
                </div>
              </SignedIn>
              <SignedOut>
                <p className="mt-8 pt-6 border-t border-neutral-200 text-sm text-surface-muted">
                  Masuk sebagai member untuk konfirmasi kehadiran.
                </p>
              </SignedOut>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
