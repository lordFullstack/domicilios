import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidad propia de Domicilios Riohacha: azul cobalto eléctrico (🚀),
        // sin parecerse al naranja de Rappi.
        primary: '#2F5EFF',       // azul cobalto vibrante (acento principal, CTAs)
        'primary-dark': '#1D3FCC',
        secondary: '#1A1A1A',     // negro suave para texto fuerte / botones secundarios
        accent: '#FFC532',        // amarillo cálido para badges/promos
        success: '#0EA96B',
        warning: '#F59E0B',
        danger: '#E11D48',
        info: '#0284C7',          // azul informativo, distinto del primary (más cobalto)
        surface: '#F7F7F5',       // fondo gris muy claro para secciones alternas
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        sans: ['"Inter"', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.10)',
        // Usadas en 13 componentes (CartFloatingBar, BottomSheet, Toast,
        // BottomNav, paneles admin, etc.) pero nunca definidas en el theme:
        // Tailwind las ignoraba en silencio y esos elementos no tenían
        // ninguna sombra en producción.
        floating: '0 8px 24px rgba(0,0,0,0.16)',
        'bottom-sheet': '0 -4px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      // Usadas en Toast, BottomSheet y CartFloatingBar pero nunca definidas:
      // esos componentes aparecían de golpe, sin el fade/slide previsto
      // (el `prefers-reduced-motion` global en styles.css ya cubre estas
      // animaciones automáticamente, no hace falta tocar nada ahí).
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-slide-up': 'fade-slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
