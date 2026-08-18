import { useState } from "react";
import { cn } from "@/shared/lib/cn";

export function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-neutral-200", className)}>
      <div className={cn("absolute inset-0 bg-neutral-200 transition-opacity duration-500", loaded ? "opacity-0" : "opacity-100 animate-pulse")} />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn("w-full h-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
