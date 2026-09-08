import { describe, it, expect } from 'vitest'
import { formatCOP } from './money'

describe('formatCOP', () => {
  it('formatea un número entero con separador de miles al estilo colombiano', () => {
    expect(formatCOP(28000)).toBe('$28.000')
  })

  it('formatea cero', () => {
    expect(formatCOP(0)).toBe('$0')
  })

  it('formatea números grandes (millones)', () => {
    expect(formatCOP(1500000)).toBe('$1.500.000')
  })

  it('nunca deja el número "pelado" sin el símbolo de peso', () => {
    expect(formatCOP(100)).toMatch(/^\$/)
  })
})
