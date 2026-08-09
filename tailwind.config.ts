import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta clara estilo Rappi: naranja/rojo vibrante sobre fondo blanco
        primary: '#FF441F',       // naranja-rojo vibrante (acento principal, CTAs)
        'primary-dark': '#E22F0C',
        secondary: '#1A1A1A',     // negro suave para texto fuerte / botones secundarios
        accent: '#FFC532',        // amarillo cálido para badges/promos
        success: '#0EA96B',
        warning: '#F59E0B',
        danger: '#E11D48',
        surface: '#F7F7F5',       // fondo gris muy claro para secciones alternas
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        sans: ['"Inter"', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
