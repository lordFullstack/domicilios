import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Azul profundo derivado de la punta del cohete de marca (ver
        // public/brand/rocket-app-icon.png) — antes era un azul eléctrico
        // genérico de SaaS (#2F5EFF) sin relación con el propio logo.
        brand: {
          50:  '#EEF0FA',
          100: '#DCE0F4',
          200: '#B9C1E9',
          300: '#8E99D6',
          400: '#5C6BB8',
          500: '#2E3A8C',
          600: '#242E70',
          700: '#1C2459',
          800: '#151A42',
          900: '#0D102A',
        },
        ink: {
          DEFAULT: '#1C1917',
          muted:   '#78716C',
          subtle:  '#A8A29E',
          faint:   '#D6D3D1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft:    '#FAFAF9',
          muted:   '#F5F5F4',
          border:  '#E7E5E4',
        },
        // Tailwind's gray-* se usa en toda la app para texto/bordes
        // secundarios; se sobreescribe con una rampa cálida (stone) para
        // que la identidad "costera" llegue a cada pantalla sin tocar
        // componente por componente.
        gray: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        accent:  '#F59E0B',
        // DEFAULT = color de fondo/ícono; `strong` = variante para TEXTO
        // sobre blanco (el DEFAULT no pasa WCAG AA como texto: 2.5:1 y
        // 2.15:1). strong: #047857 → 5.5:1, #92400E → 7.1:1.
        success: { DEFAULT: '#10B981', strong: '#047857' },
        warning: { DEFAULT: '#F59E0B', strong: '#92400E' },
        danger:  '#EF4444',
        // DEPRECATED (LOOP_VISUAL_04): sin usos; no falla AA como texto (2.77:1). No usar.
        info:    '#0EA5E9',

        // Tintes por categoría (fila de categorías del Home). Antes eran
        // hex arbitrarios dentro de CategoryScroller; ahora viven aquí para
        // que el config siga siendo la única fuente de color.
        // Iconografía propia: relleno atardecer del estado activo.
        'icon-tint': '#FFE3D1',
        category: {
          pizza:    { bg: '#FDEDE3', fg: '#C2470F' },
          burgers:  { bg: '#FCE4E1', fg: '#B8371F' },
          sushi:    { bg: '#E6EEFB', fg: '#2E3A8C' },
          postres:  { bg: '#FBE8EE', fg: '#B23A63' },
          bebidas:  { bg: '#E7F3F1', fg: '#0E7C6B' },
          asados:   { bg: '#FDF1DC', fg: '#B4700A' },
          mariscos: { bg: '#E5F3F6', fg: '#0E7490' },
        },

        // Aliases legacy — mantienen compatibilidad con componentes actuales
        primary: '#2E3A8C',
        'primary-dark': '#242E70',
        secondary: '#1C1917',
        coral: '#FF5A6B',
        'ink-muted': '#78716C',
      },

      backgroundImage: {
        // "Atardecer": el mismo barrido azul → naranja → dorado del ícono
        // de marca, ahora como el gradiente de énfasis de toda la app
        // (CTAs, hero, barra de progreso de pedido) en vez de un azul
        // plano sobre azul claro.
        'brand-gradient': 'linear-gradient(135deg, #1C2459 0%, #F4652C 62%, #FFC24B 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgba(28,36,89,0.08) 0%, rgba(244,101,44,0.06) 60%, rgba(255,194,75,0.05) 100%)',
        'mesh-hero':
          'radial-gradient(at 20% 0%, rgba(46,58,140,0.14) 0%, transparent 50%), radial-gradient(at 80% 100%, rgba(244,101,44,0.12) 0%, transparent 50%)',
      },

      fontFamily: {
        display: ['"Sora"', '"Inter"', 'system-ui', 'sans-serif'],
        sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',   { lineHeight: '1.125rem' }],
        sm:    ['0.875rem',  { lineHeight: '1.375rem' }],
        base:  ['0.9375rem', { lineHeight: '1.5rem' }],
        lg:    ['1.0625rem', { lineHeight: '1.625rem' }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem',    { lineHeight: '2rem',    letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem',  letterSpacing: '-0.03em' }],
      },

      boxShadow: {
        xs:  '0 1px 2px rgba(15,23,42,0.04)',
        sm:  '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        card: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)',
        'card-hover':
          '0 2px 4px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.10)',
        floating: '0 8px 24px rgba(15,23,42,0.12)',
        'bottom-sheet': '0 -8px 32px rgba(15,23,42,0.14)',
        'premium':
          'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.08)',
        'glow-primary': '0 8px 32px rgba(46,58,140,0.28)',
      },

      borderRadius: {
        sm:    '0.5rem',
        DEFAULT: '0.75rem',
        md:    '0.75rem',
        lg:    '0.875rem',
        xl:    '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        // Forma de marca "gota": esquina en punta arriba-derecha (nariz del cohete).
        drop:  '50% 12% 50% 50%',
      },

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },

      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(12deg)' },
          '50%': { transform: 'translateY(-6px) rotate(12deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-slide-up': 'fade-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config