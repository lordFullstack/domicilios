import { describe, it, expect } from 'vitest'
import viteConfig from '../../vite.config.ts?raw'

const all = import.meta.glob<string>(['/src/**/*.{ts,tsx,css}', '!/src/**/*.test.*'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const FILES = Object.entries(all)

const linesWhere = (test: (line: string) => boolean) =>
  FILES.flatMap(([file, src]) =>
    src
      .split('\n')
      .filter(test)
      .map((line) => `${file}: ${line.trim()}`)
  )

describe('sistema de color (LOOP_VISUAL_04)', () => {
  it('coral solo se usa en la insignia "Oferta" de FeaturedSection', () => {
    const users = FILES.filter(([, src]) => /\b(text|bg|border|ring)-coral\b/.test(src)).map(([f]) => f)
    expect(users).toEqual(['/src/features/client/components/FeaturedSection.tsx'])
  })

  it('theme_color del manifest es #1C2459 y no queda #2F5EFF en el código', () => {
    expect(viteConfig).toContain("theme_color: '#1C2459'")
    expect(viteConfig).not.toMatch(/#2F5EFF/i)
    const users = FILES.filter(([f, src]) => /#2F5EFF/i.test(src) && !f.endsWith('styles.css')).map(([f]) => f)
    expect(users).toEqual([])
  })

  it('no hay texto danger de 12px (text-xs) en la misma línea', () => {
    expect(linesWhere((l) => /text-danger/.test(l) && /text-xs|text-\[1[01]px\]/.test(l))).toEqual([])
  })

  it('success y warning como texto usan la variante strong', () => {
    expect(
      linesWhere(
        (l) => /\btext-(success|warning)(?!-)\b/.test(l) && !/<(Wifi|MailCheck|CheckCircle2|Wallet|AlertCircle)\b/.test(l)
      )
    ).toEqual([])
  })
})
