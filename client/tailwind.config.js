/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10B981", // Emerald Green
          hover: "#059669",
          light: "#E6F4EA",
        },
        secondary: {
          DEFAULT: "#3B82F6", // Blue
          hover: "#2563EB",
          light: "#EBF5FF",
        },
        expense: {
          DEFAULT: "#EF4444", // Red
          hover: "#DC2626",
          light: "#FEE2E2",
        },
        income: {
          DEFAULT: "#22C55E", // Green
          hover: "#16A34A",
          light: "#DCFCE7",
        },
        textPrimary: "#1F2937",
        textSecondary: "#6B7280",
        borderLight: "#E5E7EB",
        bgPrimary: "#FFFFFF",
        bgSecondary: "#F8FAFC",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'stitch-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'stitch-md': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'stitch-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'stitch': '16px',
      }
    },
  },
  plugins: [],
}
