import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2D6A4F",
          foreground: "#FFFFFF",
          50: "#E8F5EF",
          100: "#C8E6D7",
          200: "#95CDB0",
          300: "#62B489",
          400: "#3F8F68",
          500: "#2D6A4F",
          600: "#245640",
          700: "#1B4131",
          800: "#122B21",
          900: "#091611",
        },
        secondary: {
          DEFAULT: "#74C69D",
          foreground: "#1A1A2E",
          50: "#F0FAF5",
          100: "#D4F0E2",
          200: "#A8E1C5",
          300: "#74C69D",
          400: "#52B788",
          500: "#40916C",
          600: "#2D6A4F",
        },
        destructive: {
          DEFAULT: "#E63946",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: "#FFFFFF",
        "text-main": "#1A1A2E",
        danger: "#E63946",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
