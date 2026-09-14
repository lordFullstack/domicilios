export const colors = {
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
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    danger:  '#EF4444',
    info:    '#0EA5E9',
  },
  accent: '#F59E0B',
} as const

export type BrandColor = keyof typeof colors.brand