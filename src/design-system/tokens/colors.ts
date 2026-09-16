export const colors = {
  // Azul profundo derivado de la punta del cohete de marca
  // (public/brand/rocket-app-icon.png), ver tailwind.config.ts.
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
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    danger:  '#EF4444',
    info:    '#0EA5E9',
  },
  accent: '#F59E0B',
} as const

export type BrandColor = keyof typeof colors.brand