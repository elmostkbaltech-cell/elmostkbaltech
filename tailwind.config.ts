import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb', // royal blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#0f244a',
          950: '#071329',
        },
        navy: {
          900: '#07111e',
          950: '#040b14',
        },
        accent: {
          red: {
            light: '#f87171',
            DEFAULT: '#ef4444',
            dark: '#b91c1c',
          },
          orange: {
            light: '#fb923c',
            DEFAULT: '#f97316',
            dark: '#c2410c',
          },
          gold: {
            light: '#fde047',
            DEFAULT: '#eab308',
            dark: '#ca8a04',
          },
        },
        darkSurface: {
          DEFAULT: '#0B0F17',
          card: '#111726',
          border: '#1E293B',
          hover: '#162035',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Segoe UI', 'system-ui', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.45)',
        'glow-orange': '0 0 25px -5px rgba(249, 115, 22, 0.45)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.45)',
        'glow-gold': '0 0 25px -5px rgba(234, 179, 8, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
