import type { Config } from "tailwindcss";
import shared from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./apps/web/app/**/*.{ts,tsx}",
    "./apps/web/components/**/*.{ts,tsx}",
    "./packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", ...shared.fontFamily.sans],
        display: ["'Clash Display'", ...shared.fontFamily.sans]
      },
      colors: {
        primary: {
          DEFAULT: "#9b87f5",
          foreground: "#0b0618"
        },
        accent: {
          DEFAULT: "#f0f",
          foreground: "#0e0a1a"
        },
        neutral: {
          DEFAULT: "#14111f",
          foreground: "#f4f0ff"
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
