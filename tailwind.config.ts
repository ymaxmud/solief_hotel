import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        skyFacade: "#90CAF9",
        hotelBlue: "#5B96C1",
        coralBase: "#A14653",
        softWhite: "#E1E6E1",
        treeGreen: "#0C120F",
        greenGray: "#2C3430",
        warmSand: "#E8DCC6",
        charcoal: "#1B1F1E"
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
