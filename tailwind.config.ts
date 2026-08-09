import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy tokens (light mode) — sin cambios, siguen usándose en pantallas existentes
        primary: '#FF6B35',
        secondary: '#004E89',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',

        // Sistema oscuro/premium (nuevo) — nombres propios, no colisionan con los de arriba
        ink: '#0E0D0C',        // fondo de página: casi negro con calidez (no gris frío puro)
        surface: '#18160F',    // fondo de tarjetas
        'surface-hover': '#221F17',
        line: '#2C2820',       // bordes sutiles en vez de sombra
        ember: '#FF6B35',      // mismo naranja de marca — evoluciona la identidad, no la reemplaza
        'ember-dim': '#B84E27',
        teal: '#2DD4BF',       // acento secundario para estados "en vivo" / seguimiento
        'text-hi': '#F5F1E8',  // texto principal (blanco cálido, no #FFF puro)
        'text-mid': '#A8A190', // texto secundario
        'text-low': '#635C4E', // texto terciario / disabled
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,107,53,0.4), 0 8px 24px -4px rgba(255,107,53,0.35)',
        'glow-sm': '0 0 0 1px rgba(255,107,53,0.3), 0 4px 12px -2px rgba(255,107,53,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config
