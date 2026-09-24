import { describe, it, expect } from 'vitest'

// Reglas de errores y loading (LOOP_VISUAL_08, sub-tanda 2.3) sobre el código real
// del módulo cliente, compartidos y router.
const raw = import.meta.glob<string>(
  ['/src/features/client/**/*.{ts,tsx}', '/src/shared/**/*.{ts,tsx}', '/src/router/**/*.{ts,tsx}', '!/src/**/*.test.*'],
  { query: '?raw', import: 'default', eager: true }
)
const FILES = Object.entries(raw)
const src = (path: string) => raw[path] ?? ''

const ERROR_SITES = [
  '/src/shared/components/ErrorBoundary.tsx',
  '/src/features/client/components/RestaurantLoadError.tsx',
  '/src/features/client/components/RestaurantsGrid.tsx',
  '/src/features/client/pages/RestaurantDetailPage.tsx',
  '/src/shared/pages/NotFound.tsx',
  '/src/features/client/pages/OrderDetailPage.tsx',
]

describe('errores (LOOP_VISUAL_08)', () => {
  it.each(ERROR_SITES)('%s usa ErrorState con el copy de ERROR_COPY', (file) => {
    const s = src(file)
    expect(s).toContain('<ErrorState')
    expect(s).toContain('ERROR_COPY')
  })

  it('cada ErrorState pasa una ilustración de la tabla y una salida (reintentar o acción)', () => {
    ERROR_SITES.forEach((file) => {
      const blocks = src(file).match(/<ErrorState[\s\S]*?(\/>|<\/ErrorState>)/g) ?? []
      expect(blocks.length, file).toBeGreaterThan(0)
      blocks.forEach((b) => {
        expect(b, file).toContain('illustration=')
        expect(/onRetry=|action=/.test(b), `${file}: falta salida`).toBe(true)
      })
    })
  })

  it('ningún error usa EmptyState role="alert" ni "Algo salió mal" suelto', () => {
    FILES.forEach(([file, s]) => {
      expect(s, file).not.toMatch(/<EmptyState[^>]*role="alert"/)
    })
    const dup = FILES.filter(([f, s]) => /Algo salió mal/.test(s) && !f.endsWith('stateCopy.ts')).map(([f]) => f)
    expect(dup).toEqual([])
  })

  it('el 404 no ofrece reintento (CTA según sesión) y el resto de cargas sí', () => {
    expect(src('/src/shared/pages/NotFound.tsx')).not.toContain('onRetry')
    expect(src('/src/features/client/components/RestaurantLoadError.tsx')).toContain('onRetry')
    expect(src('/src/shared/components/ErrorBoundary.tsx')).toContain('onRetry')
  })
})

describe('EmptyState: sin icon (LOOP_VISUAL_08)', () => {
  it('ningún sitio pasa icon= a EmptyState y el componente ya no lo define', () => {
    FILES.forEach(([file, s]) => {
      const blocks = s.match(/<EmptyState[\s\S]*?\/>/g) ?? []
      blocks.forEach((b) => expect(b, file).not.toMatch(/\bicon=/))
    })
    const def = src('/src/shared/components/EmptyState.tsx')
    expect(def).not.toMatch(/\bicon\b/)
    expect(def).not.toContain('@deprecated')
    expect(def).toMatch(/illustration: IllustrationName/) // obligatoria
  })
})

describe('loading (LOOP_VISUAL_08)', () => {
  const LOADING_SITES: [string, string][] = [
    ['/src/features/client/pages/OrdersPage.tsx', 'Cargando pedidos'],
    ['/src/features/client/pages/OrderDetailPage.tsx', 'Cargando pedido'],
    ['/src/shared/components/OrderItemsList.tsx', 'Cargando productos del pedido'],
    ['/src/features/client/components/DeliveryTrackingSection.tsx', 'Cargando mapa'],
  ]

  it.each(LOADING_SITES)('%s usa LoadingState (label "%s") con skeleton', (file, label) => {
    const s = src(file)
    expect(s).toContain('<LoadingState')
    expect(s).toContain(label)
    expect(s).toContain('Skeleton')
  })

  it('ProtectedRoute y PageLoader usan LoadingState fullScreen (Spinner único)', () => {
    expect(src('/src/router/ProtectedRoute.tsx')).toContain('<LoadingState fullScreen')
    expect(src('/src/router/index.tsx')).toContain('<LoadingState fullScreen')
  })

  it('no queda texto "Cargando…" suelto en cliente, compartidos ni router', () => {
    // CheckoutPage: "Cargando..." es la etiqueta del botón mientras llegan los datos, no un estado de carga.
    const offenders = FILES.filter(([f, s]) => /Cargando(\.\.\.|…)/.test(s) && !f.endsWith('CheckoutPage.tsx')).map(([f]) => f)
    expect(offenders).toEqual([])
  })

  it('no quedan spinners paralelos: animate-spin y Loader2 solo en Spinner (y en Button)', () => {
    const ALLOWED = ['/src/shared/components/Spinner.tsx', '/src/shared/components/Button.tsx']
    const offenders = FILES.filter(([f, s]) => /animate-spin|Loader2/.test(s) && !ALLOWED.includes(f)).map(([f]) => f)
    expect(offenders).toEqual([])
  })
})
