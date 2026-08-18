import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Gradient-shimmer loading placeholder — Design.md §6 ("konsisten dengan
 * brand, terasa lebih cepat secara persepsi" vs a plain spinner). */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-neutral-200/70 bg-[length:200%_100%] bg-gradient-to-r from-neutral-200/70 via-neutral-50 to-neutral-200/70 animate-shimmer motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
