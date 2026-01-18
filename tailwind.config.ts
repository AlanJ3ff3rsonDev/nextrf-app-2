import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NextRF Brand Colors - Pastel palette (softer, modern)
        primary: {
          50: "#EEF6FF",
          100: "#DCEEFF",
          200: "#B9DCFF",
          300: "#8AC4FF",
          400: "#5AABFF",
          500: "#4A9BE8", // Soft pastel blue
          600: "#3B7FBF",
          700: "#2D6396",
          800: "#1E476D",
          900: "#0F2B44",
        },
        secondary: {
          50: "#FFF8F0",
          100: "#FFEEDD",
          200: "#FFDBB8",
          300: "#FFC48A",
          400: "#FFAD5C",
          500: "#F5A352", // Soft pastel orange
          600: "#DB8A3D",
          700: "#B87230",
          800: "#8C5624",
          900: "#5C3818",
        },
        // Semantic colors - Pastel versions
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          500: "#4ADE80", // Soft pastel green
          600: "#22C55E",
          700: "#16A34A",
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          500: "#F87171", // Soft pastel red
          600: "#EF4444",
          700: "#DC2626",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          500: "#FBBF24", // Soft pastel yellow
          600: "#F59E0B",
          700: "#D97706",
        },
        // UI colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
        medium: "0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.08)",
        strong: "0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "bounce-soft": "bounce-soft 1s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "confetti": "confetti 1s ease-out forwards",
      },
      keyframes: {
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10%)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        "confetti": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-500px) rotate(720deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
