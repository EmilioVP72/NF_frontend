/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#050505',
          surface: '#111111',
          border: '#222222',
        },
        gold: {
          light: '#F3E5AB',
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
        },
        silver: {
          DEFAULT: '#C0C0C0',
          dark: '#A9A9A9',
        },
        slate: {
          400: '#94A3B8',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      }
    },
  },
  plugins: [],
}
