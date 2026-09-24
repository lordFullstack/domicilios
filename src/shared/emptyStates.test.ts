import { describe, it, expect } from 'vitest'
import { EMPTY_COPY } from './constants/stateCopy'

// Reglas de los empty states (LOOP_VISUAL_08, sub-tanda 2.2) sobre el código real.
const raw = import.meta.glob<string>(['/src/features/client/**/*.tsx', '/src/shared/**/*.tsx', '!/src/**/*.test.*'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const src = (path: string) => raw[path] ?? ''

const EMPTY_SITES: [string, (keyof typeof EMPTY_COPY)[]][] = [
  ['/src/features/client/pages/CartPage.tsx', ['cart']],
  ['/src/features/client/pages/CheckoutPage.tsx', ['cart']],
  ['/src/features/client/pages/OrdersPage.tsx', ['orders']],
  ['/src/features/client/pages/RestaurantListPage.tsx', ['noRestaurants', 'noResults']],
  ['/src/features/client/components/RestaurantsGrid.tsx', ['noRestaurants']],
  ['/src/features/client/pages/CategoryResultsPage.tsx', ['emptyCategory']],
  ['/src/features/client/pages/RestaurantDetailPage.tsx', ['emptyMenu']],
  ['/src/shared/pages/NotificationsPage.tsx', ['notificationsUnread', 'notificationsAll']],
  ['/src/shared/components/NotificationBell.tsx', ['notificationsAll']],
]

describe('empty states (LOOP_VISUAL_08)', () => {
  it.each(EMPTY_SITES)('%s usa EmptyState con el copy de la tabla', (file, keys) => {
    const s = src(file)
    expect(s, 'importa EmptyState').toContain("EmptyState")
    expect(s, 'importa stateCopy').toContain('@/shared/constants/stateCopy')
    keys.forEach((k) => expect(s, `EMPTY_COPY.${k}`).toContain(`EMPTY_COPY.${k}`))
  })

  it('los empty states pasan la ilustración de la tabla (nunca un icon)', () => {
    EMPTY_SITES.forEach(([file]) => {
      const blocks = src(file).match(/<EmptyState[\s\S]*?\/>/g) ?? []
      blocks.forEach((b) => {
        // Los que aún son errores (icon=…) se migran a ErrorState en la sub-tanda 2.3.
        if (/icon=/.test(b)) return
        expect(b, file).toContain('illustration=')
      })
    })
  })

  it('el copy viejo ya no existe en los empty states migrados', () => {
    const old = [
      'No tienes órdenes',
      'Realiza tu primera orden ahora',
      'Todavía no hay restaurantes disponibles',
      'No encontramos restaurantes con esos filtros',
      'Sin productos disponibles',
      'No encontramos productos',
      'No hay productos para ordenar',
      'Sin notificaciones',
      'No tienes notificaciones todavía',
      'Ir a restaurantes',
    ]
    EMPTY_SITES.forEach(([file]) => old.forEach((t) => expect(src(file), `${file}: "${t}"`).not.toContain(t)))
  })

  it('cada CTA de la tabla se usa como etiqueta del botón', () => {
    expect(src('/src/features/client/pages/CartPage.tsx')).toContain('EMPTY_COPY.cart.cta')
    expect(src('/src/features/client/pages/OrdersPage.tsx')).toContain('EMPTY_COPY.orders.cta')
    expect(src('/src/features/client/pages/RestaurantListPage.tsx')).toContain('EMPTY_COPY.noResults.cta')
    expect(src('/src/features/client/pages/RestaurantDetailPage.tsx')).toContain('EMPTY_COPY.emptyMenu.cta')
    expect(src('/src/features/client/pages/CategoryResultsPage.tsx')).toContain('EMPTY_COPY.emptyCategory.cta')
  })

  it('el vacío de restaurantes por zona no ofrece CTA (el selector de dirección es LOOP_CLIENT_06)', () => {
    expect('cta' in EMPTY_COPY.noRestaurants).toBe(false)
  })

  it('el popover de la campana usa EmptyState en tamaño sm', () => {
    expect(src('/src/shared/components/NotificationBell.tsx')).toMatch(/<EmptyState\s+size="sm"/)
  })
})
