import { cn } from "@/shared/lib/cn";

/** Small eyebrow label above headings — Design.md §5 (added 2026-08-19).
 * Quiet context, not attention: muted color, not the gradient system. */
export function KickerLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground", className)}>
      {children}
    </p>
  );
}
