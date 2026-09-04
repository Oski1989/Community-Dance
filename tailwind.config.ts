import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F17",
        surface: "#131B2E",
        "surface-card": "rgba(19, 27, 46, 0.7)",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        brand: {
          violet: "#8B5CF6",
          gold: "#F59E0B",
          emerald: "#10B981",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.5)',
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.5)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.5)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
