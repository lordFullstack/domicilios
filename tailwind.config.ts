import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Domicilios Riohacha — navy / rojo / naranja (ver mockup de marca)
        primary: '#FF2D2D',       // rojo — CTAs, precios, links de acción
        'primary-dark': '#D91F1F', // hover/active del rojo
        secondary: '#0B1D37',     // navy — headers, títulos, botones secundarios
        accent: '#FF8A00',        // naranja — badges, promos, estados "pendiente"
        success: '#0EA96B',       // verde — estados "entregado" / completado
        warning: '#FF8A00',       // alineado con accent para estados "pendiente"
        danger: '#E11D48',        // estados "cancelado"
        surface: '#F4F6FA',       // fondo gris claro de marca
        ink: '#1D2433',           // texto oscuro de marca (uso puntual, no reemplaza gray-*)
        info: '#1657E6',          // azul de marca — callouts informativos
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        sans: ['"Poppins"', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(11,29,55,0.06)',
        'card-hover': '0 6px 20px rgba(11,29,55,0.12)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
