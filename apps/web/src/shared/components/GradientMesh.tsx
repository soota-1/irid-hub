import { cn } from "@/shared/lib/cn";

export interface GradientMeshProps {
  className?: string;
}

/** The slow-moving animated gradient mesh background — Design.md §1/§6.
 * Respects prefers-reduced-motion via the `motion-reduce:animate-none`
 * utility (the mesh becomes a static gradient instead). */
export function GradientMesh({ className }: GradientMeshProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 bg-iridescent bg-mesh-lg animate-mesh-move motion-reduce:animate-none opacity-90",
        className,
      )}
    />
  );
}
