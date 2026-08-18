import type { Config } from "tailwindcss";
import preline from "preline/plugin";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./node_modules/preline/dist/*.js"],
  theme: {
    extend: {
      colors: {
        neutral: {
          950: "var(--neutral-950)",
          800: "var(--neutral-800)",
          500: "var(--neutral-500)",
          200: "var(--neutral-200)",
          50: "var(--neutral-50)",
        },
        iri: {
          violet: "var(--iri-violet)",
          magenta: "var(--iri-magenta)",
          coral: "var(--iri-coral)",
          amber: "var(--iri-amber)",
          mint: "var(--iri-mint)",
          cyan: "var(--iri-cyan)",
          azure: "var(--iri-azure)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        surface: "var(--surface)",
      },
      textColor: {
        surface: "var(--surface-text)",
        "surface-muted": "var(--surface-text-muted)",
      },
      backgroundImage: {
        iridescent: "var(--gradient-iridescent)",
        events: "var(--gradient-events)",
        schedules: "var(--gradient-schedules)",
        achievements: "var(--gradient-achievements)",
        gallery: "var(--gradient-gallery)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
      },
      fontFamily: {
        display: ["'Clash Display'", "system-ui", "sans-serif"],
        body: ["'Inter'", "'General Sans'", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.05", fontWeight: "700" }],
        h1: ["2.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["1.875rem", { lineHeight: "1.2", fontWeight: "600" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      keyframes: {
        "mesh-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "mesh-move": "mesh-move 24s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear",
      },
      backgroundSize: {
        "mesh-lg": "200% 200%",
      },
    },
  },
  plugins: [preline, typography],
} satisfies Config;
