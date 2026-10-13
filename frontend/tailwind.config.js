/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
          hover: 'var(--card-hover)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          light: '#34D399',
          dark: '#059669',
        },
        accent: {
          DEFAULT: '#F59E0B', // Warm Amber
          hover: '#D97706',
        },
        border: 'var(--border)',
        emerald: {
          950: '#062016',
          900: '#0F382A',
          800: '#14533D',
          500: '#10B981',
          400: '#34D399',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
