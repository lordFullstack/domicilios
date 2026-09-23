import { describe, it, expect, vi } from 'vitest'

// El componente importa hooks que crean el cliente de Supabase al cargar.
vi.mock('@/hooks/useLocalData', () => ({ useNotifications: vi.fn() }))
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: vi.fn() }))
import { bellLabel } from './NotificationBell'

describe('bellLabel', () => {
  it('sin no leídas no menciona "sin leer"', () => {
    expect(bellLabel(0)).toBe('Notificaciones')
  })
  it('incluye el conteo', () => {
    expect(bellLabel(4)).toBe('Notificaciones, 4 sin leer')
  })
  it('más de 99 se anuncia en palabras', () => {
    expect(bellLabel(150)).toBe('Notificaciones, más de 99 sin leer')
  })
})
