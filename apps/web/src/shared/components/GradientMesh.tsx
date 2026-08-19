import { cn } from "@/shared/lib/cn";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

/** Subtle animated gradient mesh background — Design.md §3 (hero, CTA
 * sections). Animation disabled under prefers-reduced-motion. */
export function GradientMesh({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-40 blur-3xl",
        "bg-iridescent bg-[length:200%_200%]",
        !reducedMotion && "animate-mesh-move",
        className,
      )}
    />
  );
}
