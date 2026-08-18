import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const SHOW_AFTER_PX = 500;

/** Design.md §8: reappears when the user scrolls back up after having
 * scrolled far down, rather than staying pinned the whole time. */
export function StickyJoinCta() {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      const scrollingUp = y < lastY.current;
      setVisible(y > SHOW_AFTER_PX && scrollingUp);
      lastY.current = y;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 z-30"
        >
          <div className="rounded-lg bg-surface border border-neutral-200 shadow-2xl p-4 flex items-center gap-4">
            <p className="text-sm font-medium">Tertarik gabung komunitas?</p>
            <Link
              to="/gabung"
              className="shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium text-white bg-iridescent"
            >
              Daftar
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
