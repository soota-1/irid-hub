import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "@/shared/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";

/** Smooth scroll for the whole app, synced to the GSAP ticker so
 * ScrollTrigger stays in sync (Design.md §6). Disabled entirely under
 * prefers-reduced-motion — native scroll takes over instead. */
export function useLenis() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({ autoRaf: false });

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reducedMotion]);
}
