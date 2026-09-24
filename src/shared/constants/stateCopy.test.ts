import { describe, it, expect } from 'vitest'
import { EMPTY_COPY, ERROR_COPY, type StateCopy } from './stateCopy'

const ILLUSTRATIONS = ['idle', 'success', 'emptyCart', 'noResults', 'confused', 'sad']
const ALL: [string, StateCopy][] = [...Object.entries(EMPTY_COPY), ...Object.entries(ERROR_COPY)]

describe('tabla de copy de estados (LOOP_VISUAL_08)', () => {
  it.each(ALL)('%s: usa una de las 6 ilustraciones existentes, con título y descripción', (_k, copy) => {
    expect(ILLUSTRATIONS).toContain(copy.illustration)
    expect(copy.title.length).toBeGreaterThan(0)
    expect(copy.description?.length ?? 0).toBeGreaterThan(0)
  })

  it.each(ALL)('%s: voz de la app (sin "lo sentimos", tecnicismos, exclamaciones ni "Cargando")', (_k, copy) => {
    const text = `${copy.title} ${copy.description ?? ''} ${copy.cta ?? ''}`
    expect(text).not.toMatch(/lo sentimos|disculp|error 5|excepci|servidor|undefined|null/i)
    expect(text).not.toMatch(/[!¡]/)
    expect(text).not.toMatch(/Cargando/)
  })

  it('valores clave de la tabla aprobada', () => {
    expect(EMPTY_COPY.cart).toMatchObject({ illustration: 'emptyCart', title: 'Tu carrito está vacío', cta: 'Explorar restaurantes' })
    expect(EMPTY_COPY.noResults).toMatchObject({ illustration: 'noResults', title: 'Sin resultados', cta: 'Limpiar filtros' })
    expect(EMPTY_COPY.noRestaurants).toMatchObject({ illustration: 'confused', title: 'Aún no hay restaurantes en tu zona' })
    expect(EMPTY_COPY.emptyMenu).toMatchObject({ illustration: 'idle', title: 'Menú en preparación', cta: 'Ver otros restaurantes' })
    expect(EMPTY_COPY.notificationsUnread).toMatchObject({ illustration: 'idle', title: 'Todo al día', description: 'Aquí verás tus notificaciones' })
    expect(EMPTY_COPY.orders).toMatchObject({ illustration: 'idle', title: 'Aún no tienes pedidos', cta: 'Explorar restaurantes' })
    expect(ERROR_COPY.boundary).toMatchObject({ illustration: 'sad', title: 'Algo salió mal', cta: 'Reintentar' })
    expect(ERROR_COPY.restaurantsNetwork).toMatchObject({ illustration: 'sad', title: 'No pudimos cargar los restaurantes' })
    expect(ERROR_COPY.notFound).toMatchObject({ illustration: 'confused', title: 'No encontramos esta página' })
  })

  it('los estados de "no hay" usan un solo patrón: no "Todavía no hay", "No tienes" ni "No hay"', () => {
    Object.values(EMPTY_COPY).forEach((c) => expect(c.title).not.toMatch(/^(Todavía no hay|No tienes|No hay)/))
  })

  it('cada error ofrece una salida (CTA) salvo el 404, cuyo CTA depende de la sesión', () => {
    Object.entries(ERROR_COPY).forEach(([k, c]) => {
      if (k !== 'notFound') expect((c as StateCopy).cta, k).toBeTruthy()
    })
  })
})
