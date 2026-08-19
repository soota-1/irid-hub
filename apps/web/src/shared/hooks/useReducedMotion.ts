import { useEffect, useState } from "react";

/** Tracks `prefers-reduced-motion`, live — Design.md §6/§9 requires every
 * non-essential animation (gradient mesh loop, hover tilt, R3F scene,
 * Lenis smoothing) to back off when this is true. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}
