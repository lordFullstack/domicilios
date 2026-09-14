import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF4FF',
          100: '#DCE7FF',
          200: '#B9CEFF',
          300: '#8AABFF',
          400: '#5A85FF',
          500: '#2F5EFF',
          600: '#1E40AF',
          700: '#1B348C',
          800: '#172B70',
          900: '#0F1D4D',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted:   '#64748B',
          subtle:  '#94A3B8',
          faint:   '#CBD5E1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft:    '#F8FAFC',
          muted:   '#F1F5F9',
          border:  '#E2E8F0',
        },
        accent:  '#F59E0B',
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#0EA5E9',

        // Aliases legacy — mantienen compatibilidad con componentes actuales
        primary: '#2F5EFF',
        'primary-dark': '#1E40AF',
        secondary: '#0F172A',
        coral: '#FF5A6B',
        'ink-muted': '#64748B',
      },

      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2F5EFF 0%, #5A85FF 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgba(47,94,255,0.08) 0%, rgba(90,133,255,0.04) 100%)',
        'mesh-hero':
          'radial-gradient(at 20% 0%, rgba(47,94,255,0.15) 0%, transparent 50%), radial-gradient(at 80% 100%, rgba(245,158,11,0.10) 0%, transparent 50%)',
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
          'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.08)',
        'glow-primary': '0 8px 32px rgba(47,94,255,0.28)',
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
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-slide-up': 'fade-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config