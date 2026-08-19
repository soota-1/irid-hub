import { useRef, type ReactNode } from "react";
import { gsap } from "@/shared/lib/gsap";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { cn } from "@/shared/lib/cn";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** CSS color (any valid value, e.g. `oklch(62% .22 295 / 0.25)`) used for
   * the hover glow shadow — identity color per feature (Design.md §4). */
  glowColor?: string;
}

/** Rest state: neutral border, no shadow. Hover: subtle 3D tilt (max ~4deg)
 * + colored shadow glow — Design.md §4/§6. Tilt is skipped entirely under
 * prefers-reduced-motion. */
export function TiltCard({ children, className, glowColor = "oklch(62% .22 295 / 0.25)" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  function ensureQuickSetters(el: HTMLDivElement) {
    if (!quickX.current) quickX.current = gsap.quickTo(el, "rotateX", { duration: 0.4, ease: "power3.out" });
    if (!quickY.current) quickY.current = gsap.quickTo(el, "rotateY", { duration: 0.4, ease: "power3.out" });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const el = ref.current;
    ensureQuickSetters(el);
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    quickY.current?.(px * 8);
    quickX.current?.(py * -8);
  }

  function handleMouseLeave() {
    if (reducedMotion || !ref.current) return;
    ensureQuickSetters(ref.current);
    quickX.current?.(0);
    quickY.current?.(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d", "--glow": glowColor } as React.CSSProperties}
      className={cn(
        "group rounded-lg border border-border bg-card transition-shadow duration-300 will-change-transform",
        "hover:shadow-[0_20px_40px_-12px_var(--glow)] hover:scale-[1.02]",
        "motion-safe:transition-transform",
        className,
      )}
    >
      {children}
    </div>
  );
}
