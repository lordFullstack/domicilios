import { describe, it, expect } from 'vitest'
import config from '../../tailwind.config'

type Entry = [string, { lineHeight?: string; letterSpacing?: string }]

const fontSize = config.theme?.extend
  ? ((config.theme.extend as { fontSize?: Record<string, Entry> }).fontSize ?? {})
  : {}
const fontFamily = (config.theme?.extend as { fontFamily?: Record<string, string[]> } | undefined)?.fontFamily ?? {}

// Tracking y leading acordados en LOOP_VISUAL_05 (Decisión 3).
const EXPECTED: Record<string, [string, string, string]> = {
  '2xs': ['0.6875rem', '1rem', '0.02em'],
  xs: ['0.75rem', '1.125rem', '0.01em'],
  sm: ['0.875rem', '1.375rem', '0em'],
  base: ['0.9375rem', '1.5rem', '0em'],
  lg: ['1.0625rem', '1.625rem', '-0.005em'],
  xl: ['1.25rem', '1.75rem', '-0.015em'],
  '2xl': ['1.5rem', '2rem', '-0.015em'],
  '3xl': ['1.875rem', '2.25rem', '-0.02em'],
  '4xl': ['2.25rem', '2.5rem', '-0.03em'],
  display: ['1.75rem', '2rem', '-0.03em'],
}

describe('escala tipográfica (LOOP_VISUAL_05)', () => {
  it.each(Object.entries(EXPECTED))('%s: tamaño, leading y tracking explícitos', (name, [size, leading, tracking]) => {
    const entry = (fontSize as Record<string, Entry>)[name]
    expect(entry, `falta fontSize.${name}`).toBeDefined()
    expect(entry[0]).toBe(size)
    expect(entry[1].lineHeight).toBe(leading)
    expect(entry[1].letterSpacing).toBe(tracking)
  })

  it('no define pasos fuera de la escala acordada', () => {
    expect(Object.keys(fontSize).sort()).toEqual(Object.keys(EXPECTED).sort())
  })

  it('las familias son display (Sora) y sans (Inter); no existe mono', () => {
    expect(Object.keys(fontFamily).sort()).toEqual(['display', 'sans'])
    expect(fontFamily.display[0]).toContain('Sora')
    expect(fontFamily.sans[0]).toContain('Inter')
  })
})

describe('archivos de tipografía (LOOP_VISUAL_05)', () => {
  it('typography.ts (duplicado) ya no existe', () => {
    const tokens = Object.keys(import.meta.glob('/src/design-system/tokens/*.ts'))
    expect(tokens.some((f) => f.endsWith('typography.ts'))).toBe(false)
  })

  it('ningún archivo de src usa font-mono ni JetBrains Mono', async () => {
    const all = import.meta.glob<string>(['/src/**/*.{ts,tsx,css}', '!/src/**/*.test.*'], {
      query: '?raw',
      import: 'default',
      eager: true,
    })
    const offenders = Object.entries(all)
      .filter(([, src]) => /\bfont-mono\b|JetBrains/.test(src))
      .map(([f]) => f)
    expect(offenders).toEqual([])
  })
})
