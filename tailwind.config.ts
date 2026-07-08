import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Boutique palette (public site) — old-money navy / grey / white.
        navy: "#0D1B2A", // deepest surface: footer, dark sections, solid header
        oxford: "#13233A", // primary button, dark cards, active states
        slate: "#34445C", // muted blue-grey: icons, info chips, secondary text
        ink: "#18202B", // primary text on light, prices
        muted: "#667085", // secondary text on light
        mist: "#E6E8EC", // soft-grey fills / chips
        canvas: "#F8F7F4", // warm white page background
        line: "#D8DDE5", // hairline borders
        champagne: "#C8A96A", // sparing accent: eyebrows, stars, thin dividers
        // Legacy tokens — retained for the admin CRM (out of scope). Public
        // components have been migrated to the semantic tokens above.
        hotelBlue: "#5B96C1",
        coralBase: "#A14653",
        softWhite: "#E1E6E1",
        treeGreen: "#0C120F",
        greenGray: "#2C3430",
        warmSand: "#E8DCC6",
        charcoal: "#18202B"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(12,18,15,.22)",
        soft: "0 18px 48px rgba(27,31,30,.12)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
