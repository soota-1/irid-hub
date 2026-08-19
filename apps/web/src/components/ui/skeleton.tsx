import { cn } from "@/shared/lib/cn";

/** Gradient shimmer skeleton — Design.md §6: "loading state pakai gradient
 * shimmer, bukan spinner polos". */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-secondary bg-[length:200%_100%] bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.08),transparent)]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
