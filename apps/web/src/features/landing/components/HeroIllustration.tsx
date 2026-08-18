/**
 * Abstract illustration for the hero — flowing ribbon forms suggesting
 * movement/dance, not a literal figure (hand-coded SVG can't do a
 * convincing human silhouette) and not a stock "team people" cliché
 * either — Design.md §5/§10.
 */
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 480" fill="none" className="w-full h-auto" aria-hidden="true">
      <defs>
        <linearGradient id="ribbon-a" x1="60" y1="80" x2="420" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="ribbon-b" x1="420" y1="60" x2="60" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="240" cy="220" r="200" fill="url(#glow)" />

      <path
        d="M90 340 C 140 260, 160 180, 120 100 C 220 140, 260 220, 220 320 C 190 360, 130 380, 90 340 Z"
        fill="url(#ribbon-a)"
        opacity={0.9}
      />
      <path
        d="M390 120 C 340 200, 320 280, 360 360 C 260 320, 220 240, 260 140 C 290 100, 350 80, 390 120 Z"
        fill="url(#ribbon-b)"
        opacity={0.85}
      />

      <circle cx="230" cy="230" r="46" fill="#FBFAFE" opacity={0.95} />
      <circle cx="230" cy="230" r="46" fill="none" stroke="url(#ribbon-a)" strokeWidth={2} />
    </svg>
  );
}
