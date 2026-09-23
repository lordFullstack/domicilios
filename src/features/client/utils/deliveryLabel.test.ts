import { describe, it, expect } from 'vitest'
import { buildDeliveryLabel } from './deliveryLabel'

describe('buildDeliveryLabel', () => {
  it('usa Riohacha si no hay dirección guardada', () => {
    expect(buildDeliveryLabel(null)).toBe('Riohacha')
    expect(buildDeliveryLabel(undefined)).toBe('Riohacha')
    expect(buildDeliveryLabel({ street: '   ' })).toBe('Riohacha')
  })

  it('muestra la calle de la última dirección con la ciudad del servicio', () => {
    expect(buildDeliveryLabel({ street: 'Calle 15 #10-20' })).toBe('Calle 15 #10-20, Riohacha')
  })

  it('ignora datos corruptos en localStorage', () => {
    expect(buildDeliveryLabel({ street: 42 })).toBe('Riohacha')
  })
})
