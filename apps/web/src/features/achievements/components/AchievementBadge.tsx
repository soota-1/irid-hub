import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SHIELD_PATH = "M32 2 L58 12 V32 C58 48 47 58 32 62 C17 58 6 48 6 32 V12 Z";

/**
 * Custom shield-shaped badge (not an icon-pack medal) with a one-time
 * light-sweep the first time it scrolls into view — Design.md §7.4/§6.
 */
export function AchievementBadge({ size = 64 }: { size?: number }) {
  const gradientId = useId();
  const clipId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={SHIELD_PATH} />
        </clipPath>
      </defs>

      <path d={SHIELD_PATH} fill={`url(#${gradientId})`} />
      <path
        d="M32 16 L36.5 25.5 L47 27 L39.5 34 L41.5 44.5 L32 39.5 L22.5 44.5 L24.5 34 L17 27 L27.5 25.5 Z"
        fill="white"
        fillOpacity={0.9}
      />

      {!prefersReducedMotion && (
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={-40}
            y={0}
            width={24}
            height={64}
            fill="white"
            fillOpacity={0.5}
            initial={{ x: -40 }}
            whileInView={{ x: 90 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeInOut", delay: 0.15 }}
            style={{ transform: "skewX(-20deg)" }}
          />
        </g>
      )}
    </svg>
  );
}
