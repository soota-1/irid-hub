import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Reveal-on-scroll helper used by StaggerReveal & one-off section
 * animations (Design.md §6 — GSAP + ScrollTrigger is the primary
 * animation driver; Framer Motion stays reserved for AnimatePresence). */
export function fadeUpStagger(targets: gsap.TweenTarget, trigger: Element, staggerMs = 50) {
  return gsap.from(targets, {
    opacity: 0,
    y: 24,
    duration: 0.5,
    ease: "power2.out",
    stagger: staggerMs / 1000,
    scrollTrigger: {
      trigger,
      start: "top 85%",
      once: true,
    },
  });
}
