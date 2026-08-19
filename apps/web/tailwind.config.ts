import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', '"Cabinet Grotesk"', "system-ui", "sans-serif"],
        body: ['"General Sans"', "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.05", fontWeight: "700" }],
        h1: ["2.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["1.875rem", { lineHeight: "1.2", fontWeight: "600" }],
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      colors: {
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        iri: {
          violet: "var(--iri-violet)",
          magenta: "var(--iri-magenta)",
          coral: "var(--iri-coral)",
          amber: "var(--iri-amber)",
          mint: "var(--iri-mint)",
          cyan: "var(--iri-cyan)",
          azure: "var(--iri-azure)",
        },
      },
      backgroundImage: {
        iridescent: "var(--gradient-iridescent)",
        "iri-events": "var(--gradient-events)",
        "iri-schedules": "var(--gradient-schedules)",
        "iri-achievements": "var(--gradient-achievements)",
        "iri-gallery": "var(--gradient-gallery)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        btn: "16px",
        lg: "24px",
      },
      keyframes: {
        "mesh-move": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "mesh-move": "mesh-move 12s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;
