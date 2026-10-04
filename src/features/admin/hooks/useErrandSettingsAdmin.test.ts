import { describe, expect, it, vi } from 'vitest'

// El hook crea el cliente de Supabase al importarse; aquí solo se prueban las validaciones.
vi.mock('@/shared/utils/supabase', () => ({ supabase: {} }))
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }))

import { isValidErrandSetting, isValidErrandSettings } from './useErrandSettingsAdmin'

describe('ajustes de Domi (mismos límites que los CHECK de la base)', () => {
  it('acepta los valores por defecto', () => {
    expect(isValidErrandSettings({ minFee: 5000, maxBudget: 100000, quoteSeconds: 120, maxRounds: 3 })).toBe(true)
  })

  it('rechaza valores fuera de rango', () => {
    expect(isValidErrandSetting('minFee', 999)).toBe(false)
    expect(isValidErrandSetting('minFee', 100001)).toBe(false)
    expect(isValidErrandSetting('maxBudget', 9999)).toBe(false)
    expect(isValidErrandSetting('quoteSeconds', 29)).toBe(false)
    expect(isValidErrandSetting('quoteSeconds', 901)).toBe(false)
    expect(isValidErrandSetting('maxRounds', 0)).toBe(false)
    expect(isValidErrandSetting('maxRounds', 11)).toBe(false)
  })

  it('rechaza decimales y vacíos', () => {
    expect(isValidErrandSetting('minFee', 5000.5)).toBe(false)
    expect(isValidErrandSetting('minFee', NaN)).toBe(false)
  })

  it('un solo campo inválido invalida el conjunto', () => {
    expect(isValidErrandSettings({ minFee: 5000, maxBudget: 100000, quoteSeconds: 5, maxRounds: 3 })).toBe(false)
  })
})
