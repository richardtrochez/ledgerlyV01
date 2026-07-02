/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta azul de confianza (Brand Colors)
        primary: {
          50: '#eff6ff',   // Azul muy claro (backgrounds)
          100: '#dbeafe',  // Azul claro (hover states)
          200: '#bfdbfe',  // Azul suave
          300: '#93c5fd',  // Azul medio claro
          400: '#60a5fa',  // Azul medio
          500: '#3b82f6',  // Azul principal (botones primarios)
          600: '#2563eb',  // Azul intenso (hover)
          700: '#1d4ed8',  // Azul oscuro
          800: '#1e40af',  // Azul muy oscuro
          900: '#1e3a8a',  // Azul profundo (texto)
        },
        // Colores semánticos
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        info: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
