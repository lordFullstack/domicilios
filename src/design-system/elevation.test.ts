import { describe, it, expect } from 'vitest'
import config from '../../tailwind.config'
import tailwindRaw from '../../tailwind.config.ts?raw'
import stylesRaw from '../styles.css?raw'

type Extend = {
  boxShadow?: Record<string, string>
  zIndex?: Record<string, string>
  backgroundImage?: Record<string, string>
}
const extend = (config.theme?.extend ?? {}) as Extend
const shadows = extend.boxShadow ?? {}

describe('sombras cálidas (LOOP_VISUAL_06)', () => {
  it('todas las sombras del config usan rgba(28,25,23,…): ninguna en gris frío', () => {
    Object.entries(shadows).forEach(([name, value]) => {
      const colors = value.match(/rgba\(([^)]+)\)/g) ?? []
      expect(colors.length, name).toBeGreaterThan(0)
      colors.forEach((c) => expect(c, `${name}: ${c}`).toMatch(/^rgba\(28,\s?25,\s?23,/))
    })
  })

  it('no queda el color frío 15,23,42 en tailwind.config.ts ni en styles.css', () => {
    expect(tailwindRaw).not.toMatch(/15,\s?23,\s?42/)
    expect(stylesRaw).not.toMatch(/15,\s?23,\s?42/)
  })

  it('los tokens de la escala existen con sus valores', () => {
    expect(shadows.card).toBe('0 1px 2px rgba(28,25,23,0.04), 0 4px 12px rgba(28,25,23,0.06)')
    expect(shadows['card-hover']).toBe('0 2px 4px rgba(28,25,23,0.04), 0 12px 32px rgba(28,25,23,0.10)')
    expect(shadows.floating).toBe('0 8px 24px rgba(28,25,23,0.12)')
    expect(shadows.hairline).toBe('inset 0 0 0 0.5px rgba(28,25,23,0.08)')
    expect(shadows['bottom-sheet']).toBe('0 -8px 32px rgba(28,25,23,0.14)')
  })

  it('bottom-nav: sombra ascendente y ligera solo para BottomNav (el bottom-sheet sigue aparte)', () => {
    expect(shadows['bottom-nav']).toBe('0 -4px 16px rgba(28,25,23,0.08)')
    expect(shadows['bottom-nav']).not.toBe(shadows['bottom-sheet'])
  })

  it('tokens muertos eliminados: xs, premium, glow-primary y el fondo mesh-hero', () => {
    ;['xs', 'premium', 'glow-primary'].forEach((k) => expect(shadows, k).not.toHaveProperty(k))
    expect(extend.backgroundImage ?? {}).not.toHaveProperty('mesh-hero')
    expect(tailwindRaw).not.toContain('mesh-hero')
  })

  it('el config documenta la escala de elevación', () => {
    expect(tailwindRaw).toContain('Sistema de elevación (LOOP_VISUAL_06)')
    ;['nivel 0: sin sombra', 'nivel 1: card', 'nivel 2: card-hover', 'nivel 3: floating', 'hairline: para definición'].forEach((l) =>
      expect(tailwindRaw).toContain(l)
    )
  })
})

describe('capas (LOOP_VISUAL_06)', () => {
  it('z-60 existe en el config (Tailwind solo trae 0–50)', () => {
    expect(extend.zIndex?.['60']).toBe('60')
  })
})

describe('.glass--bar (LOOP_VISUAL_06)', () => {
  const rule = stylesRaw.match(/\.glass--bar\s*\{([^}]*)\}/)?.[1] ?? ''

  it('existe con el mismo fondo y blur que .glass', () => {
    expect(rule).toContain('rgba(255, 255, 255, 0.72)')
    expect(rule).toContain('blur(20px) saturate(180%)')
  })

  it('solo lleva borde inferior (sin marco en los otros 3 lados)', () => {
    expect(rule).toMatch(/border:\s*0/)
    expect(rule).toContain('border-bottom: 1px solid rgba(28, 25, 23, 0.06)')
    expect(rule).not.toMatch(/border-(top|left|right):/)
  })
})
