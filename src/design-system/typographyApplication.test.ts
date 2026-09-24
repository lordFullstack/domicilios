import { describe, it, expect } from 'vitest'

// Reglas de aplicación de LOOP_VISUAL_05 sobre el código real (módulo cliente + compartidos).
const all = import.meta.glob<string>(['/src/**/*.{ts,tsx,css}', '!/src/**/*.test.*'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const FILES = Object.entries(all)
const inScope = ([f]: [string, string]) => f.startsWith('/src/features/client/') || f.startsWith('/src/shared/')
const read = (path: string) => (all[path] as string) ?? ''

describe('tipografía aplicada (LOOP_VISUAL_05)', () => {
  it('no queda texto de 10–11px en src (mínimo 12px)', () => {
    const offenders = FILES.filter(([, src]) => /text-\[(10|11)px\]/.test(src)).map(([f]) => f)
    expect(offenders).toEqual([])
  })

  it('toda cifra de precio en JSX (módulo cliente + compartidos) lleva tabular-nums', () => {
    const bad = FILES.filter(inScope).flatMap(([file, src]) =>
      src
        .split('\n')
        .filter((l) => /(?<!\$)\{formatCOP\(/.test(l) && !/tabular-nums/.test(l))
        .map((l) => `${file}: ${l.trim()}`)
    )
    expect(bad).toEqual([])
  })

  it('#orderId, fechas y horas del cliente llevan tabular-nums', () => {
    const checks: [string, RegExp][] = [
      ['/src/features/client/pages/OrderDetailPage.tsx', /tabular-nums[^\n]*\n\s*#\{order\.id/],
      ['/src/features/client/pages/OrderDetailPage.tsx', /tabular-nums[^\n]*\n\s*\{formattedDate\}/],
      ['/src/features/client/components/OrderSuccessView.tsx', /tabular-nums[^\n]*\n\s*Pedido #/],
      ['/src/features/client/components/OrderStatusTimeline.tsx', /tabular-nums[^>]*>\{updatedTime\}/],
      ['/src/shared/components/NotificationBell.tsx', /tabular-nums[^>]*>\{timeAgo/],
      ['/src/shared/pages/NotificationsPage.tsx', /tabular-nums[^>]*>\{timeAgo/],
    ]
    for (const [file, re] of checks) expect(read(file), file).toMatch(re)
  })

  it('la hora de las notificaciones es text-xs y text-gray-500 (no gray-300)', () => {
    expect(read('/src/shared/pages/NotificationsPage.tsx')).toMatch(/text-xs text-gray-500 tabular-nums mt-1">\{timeAgo/)
    expect(read('/src/shared/pages/NotificationsPage.tsx')).not.toMatch(/text-gray-300 mt-1">\{timeAgo/)
  })

  it('los 4 momentos display usan text-display + font-display + font-extrabold', () => {
    const display = /font-display[^"]*text-display[^"]*font-extrabold|text-display[^"]*font-extrabold/
    expect(read('/src/features/client/components/RestaurantHero.tsx')).toMatch(/<h1 className="[^"]*text-display[^"]*font-extrabold/)
    expect(read('/src/features/client/components/OrderSuccessView.tsx')).toMatch(/<h1 className="[^"]*text-display[^"]*font-extrabold/)
    for (const page of ['CartPage', 'CheckoutPage']) {
      expect(read(`/src/features/client/pages/${page}.tsx`)).toMatch(new RegExp(`${display.source}[^\\n]*\\{formatCOP\\(total\\)\\}`))
    }
  })

  it('jerarquía de títulos del cliente: xl (Categoría, 404), display (Home) y lg (secundarios)', () => {
    const h1 = (path: string) => read(path).match(/<h1 className="([^"]*)"/)?.[1] ?? ''
    // El saludo del Home pasó a text-display en LOOP_VISUAL_09 (ver homeStructure/HomeHeader tests).
    const xl = [
      '/src/features/client/pages/CategoryResultsPage.tsx',
    ]
    const lg = [
      '/src/features/client/pages/CartPage.tsx',
      '/src/features/client/pages/CheckoutPage.tsx',
      '/src/features/client/pages/OrdersPage.tsx',
      '/src/features/client/pages/RestaurantListPage.tsx',
      '/src/features/client/pages/OrderDetailPage.tsx',
      '/src/features/client/pages/ClientAccountPage.tsx',
      '/src/shared/pages/NotificationsPage.tsx',
    ]
    xl.forEach((f) => expect(h1(f), f).toMatch(/\btext-xl\b/))
    lg.forEach((f) => expect(h1(f), f).toMatch(/\btext-lg\b/))
    // El 404 usa ErrorState fullScreen, cuyo h1 es text-xl (ver ErrorState.test).
    expect(read('/src/shared/pages/NotFound.tsx')).toContain('<ErrorState')
  })

  it('OrderCard usa h2 (sin h3 huérfano bajo el h1 de Mis Órdenes)', () => {
    const src = read('/src/features/client/components/OrderCard.tsx')
    expect(src).toMatch(/<h2 /)
    expect(src).not.toMatch(/<h3/)
  })
})
