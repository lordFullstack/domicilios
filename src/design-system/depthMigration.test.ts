import { describe, it, expect } from 'vitest'
import stylesRaw from '../styles.css?raw'

// Migraciones de LOOP_VISUAL_06 (sub-tanda 2.2) verificadas sobre el código real.
const raw = import.meta.glob<string>(
  ['/src/features/client/**/*.tsx', '/src/shared/**/*.tsx', '/src/features/auth/**/*.tsx', '/src/features/restaurant/pages/DashboardPage.tsx', '!/src/**/*.test.*'],
  { query: '?raw', import: 'default', eager: true }
)
const src = (path: string) => raw[path] ?? ''
const FILES = Object.entries(raw)

describe('.card-surface--flat (LOOP_VISUAL_06)', () => {
  const rule = stylesRaw.match(/\.card-surface--flat\s*\{([^}]*)\}/)?.[1] ?? ''
  const after = stylesRaw.match(/\.card-surface--flat::after\s*\{([^}]*)\}/)?.[1] ?? ''

  it('nivel 1 (misma sombra que card-surface) y hairline de 0.5px en ::after', () => {
    expect(rule).toContain('0 1px 2px rgba(28, 25, 23, 0.04), 0 4px 12px rgba(28, 25, 23, 0.06)')
    expect(after).toContain('inset 0 0 0 0.5px rgba(28, 25, 23, 0.08)')
    expect(after).toContain('pointer-events: none')
  })

  it('sin hover y sin press', () => {
    expect(stylesRaw).not.toMatch(/\.card-surface--flat:(hover|active)/)
    expect(rule).not.toMatch(/transform|transition/)
  })
})

const A = ['/src/features/client/components/AddressCard.tsx', '/src/features/client/pages/CategoryResultsPage.tsx']
const A_FLAT = [
  '/src/features/client/components/OrderSummaryCard.tsx',
  '/src/features/client/components/OrderSuccessView.tsx',
  '/src/features/client/components/OrderStatusTimeline.tsx',
  '/src/shared/components/InstallAppCard.tsx',
  '/src/features/client/pages/ClientAccountPage.tsx',
]
const B = [
  '/src/features/client/components/DeliveryTrackingSection.tsx',
  '/src/features/client/pages/CartPage.tsx',
  '/src/features/client/pages/CheckoutPage.tsx',
  '/src/features/client/pages/OrderDetailPage.tsx',
]

describe('cards migradas (clasificación A / A\' / B)', () => {
  it.each(A)('A (card-surface): %s', (f) => {
    expect(src(f)).toMatch(/card-surface bg-white|card-surface rounded/)
    expect(src(f)).not.toMatch(/card-surface--flat/)
  })

  it.each(A_FLAT)("A' (card-surface--flat): %s", (f) => {
    expect(src(f)).toContain('card-surface--flat')
  })

  it.each(B)('B (hairline): %s', (f) => {
    expect(src(f)).toMatch(/\bhairline\b/)
  })

  it('las cards migradas ya no combinan border border-gray-100 con card-surface / hairline en el mismo elemento', () => {
    ;[...A, ...A_FLAT, ...B].forEach((f) => {
      src(f)
        .split(String.fromCharCode(10))
        .filter((l) => /card-surface|hairline/.test(l))
        .forEach((l) => expect(l, f).not.toContain('border border-gray-100'))
    })
  })

  it('el press de las cards A lo da card-surface (sin active:scale propio)', () => {
    A.forEach((f) => expect(src(f)).not.toMatch(/card-surface[^"]*active:scale/))
  })
})

describe('sombras fuera de sistema (LOOP_VISUAL_06)', () => {
  it('sin shadow-md / shadow-lg / shadow-primary ni sombras en corchetes en cliente, compartidos y auth', () => {
    const offenders = FILES.filter(([, s]) => /\bshadow-(md|lg|primary)\b|shadow-\[/.test(s)).map(([f]) => f)
    expect(offenders).toEqual([])
  })

  it('RestaurantHero: avatar con shadow-card y el texto conserva drop-shadow (legibilidad)', () => {
    const s = src('/src/features/client/components/RestaurantHero.tsx')
    expect(s).toContain('shadow-card')
    expect(s).toContain('drop-shadow')
  })

  it('Login y Register usan shadow-floating', () => {
    expect(src('/src/features/auth/pages/LoginPage.tsx')).toContain('shadow-floating')
    expect(src('/src/features/auth/pages/RegisterPage.tsx')).toContain('shadow-floating')
  })

  it('el marcador del mapa usa shadow-card en vez de box-shadow en línea', () => {
    const s = src('/src/shared/components/DeliveryLiveMap.tsx')
    expect(s).toContain('class="shadow-card"')
    expect(s).not.toContain('box-shadow')
  })
})

describe('vidrio único (LOOP_VISUAL_06)', () => {
  it('las barras usan .glass--bar (conservando shadow-sm en el header)', () => {
    expect(src('/src/features/client/components/RestaurantCompactHeader.tsx')).toMatch(/glass--bar[^`"]*shadow-sm/)
    expect(src('/src/features/client/components/MenuCategoryNav.tsx')).toContain('glass--bar')
  })

  it('no queda bg-white/95 backdrop-blur en el módulo cliente ni en compartidos', () => {
    const offenders = FILES.filter(
      ([f, s]) => (f.startsWith('/src/features/client/') || f.startsWith('/src/shared/')) && /bg-white\/95|backdrop-blur/.test(s)
    ).map(([f]) => f)
    expect(offenders).toEqual([])
  })
})

describe('overlays de foto (LOOP_VISUAL_06)', () => {
  it('ImageOverlay: bottom-soft (0.60) y bottom-gradient (0.90), ambos transparentes al 60%', () => {
    const s = src('/src/shared/components/ImageOverlay.tsx')
    expect(s).toContain("'bottom-gradient': 'bg-gradient-to-t from-black/90 to-transparent to-60%'")
    expect(s).toContain("'bottom-soft': 'bg-gradient-to-t from-black/60 to-transparent to-60%'")
  })

  it('PromoBanner y el Dashboard del restaurante usan ImageOverlay bottom-soft, sin gradientes sueltos', () => {
    ;['/src/features/client/components/PromoBanner.tsx', '/src/features/restaurant/pages/DashboardPage.tsx'].forEach((f) => {
      expect(src(f), f).toContain('<ImageOverlay variant="bottom-soft"')
      expect(src(f), f).not.toMatch(/from-black\/(60|70)/)
    })
  })

  it('RestaurantHero conserva bottom-gradient', () => {
    expect(src('/src/features/client/components/RestaurantHero.tsx')).toContain('variant="bottom-gradient"')
  })
})
