import { describe, expect, it, vi } from 'vitest'

// El servicio crea el cliente de Supabase al importarse; aquí solo se prueba lógica pura.
vi.mock('@/shared/utils/supabase', () => ({ supabase: {} }))

import { errandAmountDue, errandStatusLabel, errandStepIndex, errandTimelineSteps, isActiveErrand } from './errandStatus'
import { errandErrorCode, errandErrorMessage } from '../services/errandActions.service'

describe('estado del Domi', () => {
  it('quoted cuenta como el primer paso (se sigue negociando)', () => {
    expect(errandStepIndex('quoted', 'purchase')).toBe(0)
    expect(errandStepIndex('searching', 'pickup')).toBe(0)
  })

  it('avanza paso a paso hasta entregado', () => {
    expect(errandStepIndex('accepted', 'purchase')).toBe(1)
    expect(errandStepIndex('picked_up', 'purchase')).toBe(2)
    expect(errandStepIndex('in_delivery', 'purchase')).toBe(3)
    expect(errandStepIndex('delivered', 'purchase')).toBe(4)
  })

  it('el tercer paso depende del tipo', () => {
    expect(errandTimelineSteps('purchase')[2].label).toBe('Compra hecha')
    expect(errandTimelineSteps('pickup')[2].label).toBe('Recogido')
    expect(errandStatusLabel('picked_up', 'purchase')).toBe('Compra hecha')
  })

  it('solo cuenta como activo mientras no termina', () => {
    expect(isActiveErrand('in_delivery')).toBe(true)
    expect(isActiveErrand('delivered')).toBe(false)
    expect(isActiveErrand('expired')).toBe(false)
  })
})

describe('monto a pagar', () => {
  it('sin tarifa aún no hay monto', () => {
    expect(errandAmountDue({ type: 'pickup', fee: null, purchase_amount: null })).toBeNull()
  })
  it('recogida: solo la tarifa', () => {
    expect(errandAmountDue({ type: 'pickup', fee: 5000, purchase_amount: null })).toBe(5000)
  })
  it('compra: factura + tarifa', () => {
    expect(errandAmountDue({ type: 'purchase', fee: 6500, purchase_amount: 42000 })).toBe(48500)
    expect(errandAmountDue({ type: 'purchase', fee: 6500, purchase_amount: null })).toBe(6500)
  })
})

describe('errores de las funciones del servidor', () => {
  it('reconoce el código dentro del mensaje de Postgres', () => {
    expect(errandErrorCode('P0001: no_domis_available')).toBe('no_domis_available')
    expect(errandErrorMessage('over_budget')).toMatch(/presupuesto/i)
  })
  it('un error desconocido da un mensaje genérico', () => {
    expect(errandErrorMessage('boom')).toMatch(/Intenta de nuevo/)
  })
})
