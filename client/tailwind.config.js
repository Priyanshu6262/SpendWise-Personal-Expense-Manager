/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainBg: '#0B1220',
        secBg: '#0F172A',
        cardBg: '#111C2E',
        appBorder: '#263449',
        primaryGreen: '#10B981',
        greenHover: '#059669',
        purpleAI: '#6366F1',
        whiteText: '#F8FAFC',
        secText: '#94A3B8',
        mutedText: '#64748B',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          DEFAULT: '#10b981',
          hover: '#059669',
        },
        expense: {
          DEFAULT: '#EF4444',
          hover: '#dc2626',
        },
        income: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
