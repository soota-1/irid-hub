import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "../types";

const SWIPE_THRESHOLD_PX = 50;

export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const current = index !== null ? items[index] : null;

  useEffect(() => {
    if (index === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(Math.max(0, (index ?? 0) - 1));
      if (e.key === "ArrowRight") onNavigate(Math.min(items.length - 1, (index ?? 0) + 1));
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [index, items.length, onClose, onNavigate]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || index === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD_PX) onNavigate(Math.max(0, index - 1));
    else if (delta < -SWIPE_THRESHOLD_PX) onNavigate(Math.min(items.length - 1, index + 1));
    touchStartX.current = null;
  }

  return createPortal(
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-50 bg-neutral-950/95 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X size={24} />
          </button>

          {index !== null && index > 0 && (
            <button
              onClick={() => onNavigate(index - 1)}
              aria-label="Sebelumnya"
              className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {index !== null && index < items.length - 1 && (
            <button
              onClick={() => onNavigate(index + 1)}
              aria-label="Berikutnya"
              className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
          >
            {current.type === "video" ? (
              <video src={current.media_url ?? ""} controls className="max-w-[90vw] max-h-[75vh] rounded-md" />
            ) : (
              <img
                src={current.media_url ?? ""}
                alt={current.caption ?? ""}
                className="max-w-[90vw] max-h-[75vh] object-contain rounded-md"
              />
            )}
            {current.caption && <p className="text-white/80 text-sm mt-3 text-center">{current.caption}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
