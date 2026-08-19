import { useEffect, useRef, type ReactNode } from "react";
import { fadeUpStagger } from "@/shared/lib/gsap";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  /** Selector (relative to the wrapper) for the items to stagger, e.g. "> *" */
  itemSelector?: string;
  staggerMs?: number;
}

/** Wraps a list/grid and fades+slides its children up on scroll-into-view,
 * staggered 40-60ms apart (Design.md §6). No-op under reduced motion. */
export function StaggerReveal({ children, className, itemSelector = ":scope > *", staggerMs = 50 }: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;
    const items = ref.current.querySelectorAll(itemSelector);
    if (items.length === 0) return;
    const ctx = fadeUpStagger(items, ref.current, staggerMs);
    return () => {
      ctx.scrollTrigger?.kill();
      ctx.kill();
    };
  }, [reducedMotion, itemSelector, staggerMs]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
