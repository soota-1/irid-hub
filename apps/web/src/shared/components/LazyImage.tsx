import { useState } from "react";
import { cn } from "@/shared/lib/cn";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

/** Lazy-loaded image with a shimmer placeholder until it decodes
 * (Design.md §5/§11 — gallery & event cover images). */
export function LazyImage({ src, alt, className, wrapperClassName, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", wrapperClassName)}>
      {!loaded && (
        <div className="absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.08),transparent)]" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn("h-full w-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0", className)}
        {...props}
      />
    </div>
  );
}
