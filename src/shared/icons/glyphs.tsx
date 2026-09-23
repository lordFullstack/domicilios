import type { ReactNode } from 'react'

/**
 * Trazos de la iconografía propia (estilo "gota"). Diseño aprobado en el
 * lienzo "Iconografía Domicilios Riohacha" — NO editar a ojo: cualquier
 * cambio se prueba primero en el lienzo y luego se copia aquí.
 *
 * Grilla 24×24, trazo 1.75, puntas y uniones redondeadas.
 *
 * Cada parte tiene un tipo que decide cómo se pinta según la variante:
 *   fill   → forma principal: vacía en reposo, rellena en activo
 *   line   → solo trazo
 *   bg     → trazo; en activo se rellena de blanco (ventanas, puertas)
 *   dot    → relleno sólido del color del trazo (ojos, pepperoni)
 *   accent → trazo; en activo/sobre oscuro va en naranja (llamas, cereza)
 */
export type GlyphPartKind = 'fill' | 'line' | 'bg' | 'dot' | 'accent'
export type GlyphPart = [GlyphPartKind, ReactNode]

export const GLYPHS = {
  // Cohete
  rocket: [
    ['fill', <><path d="M12 2.75c2.9 1.9 4.5 5.3 4.5 9.25v4.25h-9V12c0-3.95 1.6-7.35 4.5-9.25Z"/></>],
    ['line', <><path d="M7.5 12.5 5 15.5v2.75h2.5M16.5 12.5 19 15.5v2.75h-2.5"/></>],
    ['bg', <><circle cx="12" cy="9" r="1.75"/></>],
    ['accent', <><path d="M10 16.25c0 2.3.7 3.9 2 5 1.3-1.1 2-2.7 2-5"/></>],
  ],
  // Cohete · éxito
  rocketSuccess: [
    ['fill', <><path d="M12 2.75c2.9 1.9 4.5 5.3 4.5 9.25v4.25h-9V12c0-3.95 1.6-7.35 4.5-9.25Z"/></>],
    ['line', <><path d="M7.5 12.5 5 15.5v2.75h2.5M16.5 12.5 19 15.5v2.75h-2.5"/></>],
    ['bg', <><circle cx="12" cy="9" r="1.75"/></>],
    ['accent', <><path d="M9.25 16.25c0 3 1 5.1 2.75 6.25 1.75-1.15 2.75-3.25 2.75-6.25M3.25 20.75l1.5-.9M20.75 20.75l-1.5-.9M2.75 17.5h1.5M21.25 17.5h-1.5"/></>],
  ],
  // Domiciliario
  moto: [
    ['fill', <><rect x="3.5" y="7" width="5" height="4.5" rx="1"/></>],
    ['line', <><circle cx="6" cy="17.5" r="2.75"/><circle cx="18" cy="17.5" r="2.75"/><path d="M8.75 17.5h5.75l1.75-4.25M18 17.5l-2-7M14.5 10.5h3M7.5 13.5h6.25"/></>],
  ],
  // Bolsa / carrito
  bag: [
    ['fill', <><path d="M6 8.5h12l-.9 10.6a1.5 1.5 0 0 1-1.5 1.4H8.4a1.5 1.5 0 0 1-1.5-1.4L6 8.5Z"/></>],
    ['line', <><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5M9.5 12.75a2.5 2.5 0 0 0 5 0"/></>],
  ],
  // Pizza
  pizza: [
    ['fill', <><path d="M4.75 6.75c4.5-3 10-3 14.5 0L12 20.75 4.75 6.75Z"/></>],
    ['line', <><path d="M6.3 9.7c3.6-2.2 7.8-2.2 11.4 0"/></>],
    ['dot', <><circle cx="10.25" cy="12.25" r="1.1"/><circle cx="14" cy="12.75" r="1.1"/><circle cx="12" cy="16.25" r="1"/></>],
  ],
  // Burgers
  burger: [
    ['fill', <><path d="M4.5 11a7.5 5.5 0 0 1 15 0H4.5Z"/><rect x="4.5" y="15.25" width="15" height="2.5" rx="1.25"/></>],
    ['line', <><path d="M4.5 13.25q1.875-1.25 3.75 0t3.75 0 3.75 0 3.75 0"/><rect x="5.25" y="19" width="13.5" height="1.75" rx=".875"/></>],
    ['dot', <><circle cx="10" cy="8.25" r=".6"/><circle cx="13.75" cy="8" r=".6"/></>],
  ],
  // Sushi
  sushi: [
    ['fill', <><circle cx="12" cy="12" r="8"/></>],
    ['bg', <><circle cx="12" cy="12" r="4.5"/></>],
    ['dot', <><circle cx="12" cy="12" r="1.75"/></>],
  ],
  // Postres
  dessert: [
    ['fill', <><path d="M6.25 11.5a5.75 5 0 0 1 11.5 0H6.25Z"/></>],
    ['line', <><path d="M6.75 11.5 8.1 19.6a1 1 0 0 0 1 .9h5.8a1 1 0 0 0 1-.9l1.35-8.1M10.5 14v4M13.5 14v4"/></>],
    ['accent', <><path d="M12.5 5.25c.25-1 .9-1.75 1.75-2.1"/><circle cx="12" cy="5.75" r="1.1"/></>],
  ],
  // Bebidas
  drink: [
    ['fill', <><path d="M6.5 8.5h11l-1.2 11.1a1 1 0 0 1-1 .9H8.7a1 1 0 0 1-1-.9L6.5 8.5Z"/></>],
    ['line', <><path d="M5.5 8.5h13M13 8.5l1.75-5.25h2.75M7.1 13h9.8"/></>],
  ],
  // Asados (chuzo)
  grill: [
    ['line', <><path d="M3.75 20.25 20.25 3.75"/></>],
    ['fill', <><rect x="5.5" y="13.5" width="5" height="5" rx="1.25" transform="rotate(45 8 16)"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.25" transform="rotate(45 12 12)"/><rect x="13.5" y="5.5" width="5" height="5" rx="1.25" transform="rotate(45 16 8)"/></>],
  ],
  // Mariscos
  seafood: [
    ['fill', <><path d="M3.5 12c2.8-4.2 9.2-4.9 13.5 0-4.3 4.9-10.7 4.2-13.5 0Z"/></>],
    ['line', <><path d="M17 12l3.5-3.5v7L17 12ZM8.75 9.4c.8 1.6.8 3.6 0 5.2"/></>],
    ['dot', <><circle cx="6.4" cy="11.25" r=".85"/></>],
  ],
  // Inicio
  home: [
    ['fill', <><path d="M4.5 10.2 12 4l7.5 6.2V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19v-8.8Z"/></>],
    ['bg', <><path d="M10 20.5V16a2 2 0 0 1 4 0v4.5"/></>],
  ],
  // Restaurantes
  restaurants: [
    ['fill', <><path d="M5 16a7 7 0 0 1 14 0H5Z"/></>],
    ['line', <><path d="M3.5 16h17M6 19.25h12M12 9V7.5"/><circle cx="12" cy="6.25" r="1.25"/></>],
  ],
  // Pedidos
  orders: [
    ['fill', <><path d="M6 3.5h12v17l-2-1.25-2 1.25-2-1.25-2 1.25-2-1.25-2 1.25v-17Z"/></>],
    ['line', <><path d="M9 8h6M9 11.5h6M9 15h3.5"/></>],
  ],
  // Perfil
  profile: [
    ['fill', <><circle cx="12" cy="8.5" r="3.75"/><path d="M4.75 20.25a7.25 6.25 0 0 1 14.5 0H4.75Z"/></>],
  ],
  // Favorito
  heart: [
    ['fill', <><path d="M12 20s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/></>],
  ],
  // Notificaciones
  bell: [
    ['fill', <><path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.75H5l1.5-1.75Z"/></>],
    ['line', <><path d="M10 20.25a2 2 0 0 0 4 0M12 4.25v1.25"/></>],
  ],
  // Ubicación
  pin: [
    ['fill', <><path d="M12 21s-6.5-5.9-6.5-11a6.5 6.5 0 0 1 13 0c0 5.1-6.5 11-6.5 11Z"/></>],
    ['bg', <><circle cx="12" cy="10" r="2.25"/></>],
  ],
  // Buscar
  search: [
    ['fill', <><circle cx="10.75" cy="10.75" r="6"/></>],
    ['line', <><path d="M15.25 15.25 20 20"/></>],
  ],
} satisfies Record<string, GlyphPart[]>

export type IconName = keyof typeof GLYPHS
export const ICON_NAMES = Object.keys(GLYPHS) as IconName[]
