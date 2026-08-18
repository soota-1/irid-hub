import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type CardAccent = "none" | "events" | "schedules" | "achievements" | "gallery";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Feature identity color for the gradient border — Design.md §4/§7.2.
   * Use sparingly (e.g. a top achievement card), not on every card. */
  accent?: CardAccent;
}

const accentShadow: Record<CardAccent, string> = {
  none: "shadow-sm",
  events: "shadow-[0_20px_40px_-16px_rgba(139,92,246,0.3)]",
  schedules: "shadow-[0_20px_40px_-16px_rgba(34,211,238,0.3)]",
  achievements: "shadow-[0_20px_40px_-16px_rgba(251,191,36,0.3)]",
  gallery: "shadow-[0_20px_40px_-16px_rgba(52,211,153,0.3)]",
};

const accentGradient: Record<CardAccent, string> = {
  none: "",
  events: "bg-events",
  schedules: "bg-schedules",
  achievements: "bg-achievements",
  gallery: "bg-gallery",
};

export function Card({ className, accent = "none", children, ...props }: CardProps) {
  if (accent === "none") {
    return (
      <div className={cn("rounded-lg bg-surface border border-neutral-200", accentShadow.none, className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg p-px", accentGradient[accent], accentShadow[accent], className)} {...props}>
      <div className="rounded-[calc(var(--radius-lg)-1px)] bg-surface h-full w-full">{children}</div>
    </div>
  );
}
