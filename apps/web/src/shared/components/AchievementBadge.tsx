import { useEffect, useRef } from "react";
import { gsap } from "@/shared/lib/gsap";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import { cn } from "@/shared/lib/cn";

interface AchievementBadgeProps {
  className?: string;
}

/** Custom SVG shield (Design.md §7/§16 — no emoji, no 3D). One-time
 * light-sweep shimmer when it first enters the viewport. */
export function AchievementBadge({ className }: AchievementBadgeProps) {
  const shimmerRef = useRef<SVGRectElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !shimmerRef.current || !wrapperRef.current) return;
    const tween = gsap.fromTo(
      shimmerRef.current,
      { x: -60 },
      {
        x: 60,
        duration: 1.1,
        ease: "power2.inOut",
        scrollTrigger: { trigger: wrapperRef.current, start: "top 85%", once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapperRef} className={cn("relative h-16 w-14 shrink-0", className)}>
      <svg viewBox="0 0 56 64" fill="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="badge-grad" x1="0" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--iri-amber)" />
            <stop offset="100%" stopColor="var(--iri-coral)" />
          </linearGradient>
          <clipPath id="badge-clip">
            <path d="M28 2 L52 12 V30 C52 46 42 56 28 62 C14 56 4 46 4 30 V12 Z" />
          </clipPath>
        </defs>
        <path
          d="M28 2 L52 12 V30 C52 46 42 56 28 62 C14 56 4 46 4 30 V12 Z"
          fill="url(#badge-grad)"
          stroke="oklch(1 0 0 / 0.25)"
          strokeWidth="1"
        />
        <path
          d="M19 32 L25 38 L37 24"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <g clipPath="url(#badge-clip)">
          <rect ref={shimmerRef} x="-20" y="-10" width="20" height="84" fill="white" opacity="0.35" transform="skewX(-20)" />
        </g>
      </svg>
    </div>
  );
}
