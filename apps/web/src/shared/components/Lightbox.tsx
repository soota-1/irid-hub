import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface LightboxItem {
  media_url: string;
  caption?: string | null;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/** Framer Motion AnimatePresence for mount/unmount — Design.md §6 reserves
 * Framer specifically for this pattern. Keyboard arrows (desktop) + close
 * on Escape; touch swipe is handled by native horizontal scroll snap on
 * mobile via the caller's grid, this component covers desktop nav. */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const { t } = useTranslation("common");
  const isOpen = index !== null;
  const current = index !== null ? items[index] : null;

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index !== null && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index !== null && index < items.length - 1) onNavigate(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, index, items.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("lightbox.close")}
            className="absolute right-4 top-4 rounded-full p-2 text-foreground/80 hover:bg-secondary hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>

          {index !== null && index > 0 && (
            <button
              type="button"
              aria-label={t("lightbox.previous")}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(index - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-foreground/80 hover:bg-secondary hover:text-foreground sm:left-6"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}
          {index !== null && index < items.length - 1 && (
            <button
              type="button"
              aria-label={t("lightbox.next")}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(index + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-foreground/80 hover:bg-secondary hover:text-foreground sm:right-6"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          <motion.figure
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex max-h-full max-w-4xl flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={current.media_url} alt={current.caption ?? ""} className="max-h-[80vh] rounded-md object-contain" />
            {current.caption && <figcaption className="text-sm text-muted-foreground">{current.caption}</figcaption>}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
