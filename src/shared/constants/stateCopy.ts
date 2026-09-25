import type { IllustrationName } from '@/shared/illustrations'

/**
 * Fuente única del copy de los estados (empty / error) — LOOP_VISUAL_08.
 * Los componentes lo consumen y los tests lo comparan, para que el copy no
 * se desincronice. No hay i18n en el proyecto, así que vive aquí.
 *
 * Voz: tuteo, cálida sin ser infantil, sin exclamaciones excesivas, sin
 * "lo sentimos" corporativo y sin tecnicismos. Estructura: título breve
 * (qué pasa) + descripción (qué puedes hacer / qué viene) + CTA.
 * `cta` es solo la etiqueta: cada pantalla decide a dónde lleva.
 *
 * Ilustraciones: solo las 6 de LOOP_VISUAL_03 (`idle` para los estados sin
 * una específica). Las 4 nuevas (NoOrders, NoFavorites, Location,
 * NoConnection) llegan con LOOP_VISUAL_03B: entonces solo cambia el nombre.
 */
export interface StateCopy {
  illustration: IllustrationName
  title: string
  description?: string
  cta?: string
  /** Segunda salida (opcional), p. ej. "Ver restaurantes". */
  ctaSecondary?: string
}

const CTA_EXPLORE = 'Explorar restaurantes'

export const EMPTY_COPY = {
  /** CartPage y CheckoutPage (antes con copys distintos). */
  cart: {
    illustration: 'emptyCart',
    title: 'Tu carrito está vacío',
    description: 'Explora restaurantes y encuentra algo delicioso',
    cta: CTA_EXPLORE,
  },
  /** RestaurantListPage con búsqueda o filtros activos. */
  noResults: {
    illustration: 'noResults',
    title: 'Sin resultados',
    description: 'Prueba con otros filtros o cambia la búsqueda',
    cta: 'Limpiar filtros',
  },
  /** RestaurantListPage y Home sin ningún restaurante. Sin CTA: el selector de dirección es LOOP_CLIENT_06. */
  noRestaurants: {
    illustration: 'confused',
    title: 'Aún no hay restaurantes en tu zona',
    description: 'Estamos trabajando para traer más opciones',
  },
  /** RestaurantDetailPage sin productos. */
  emptyMenu: {
    illustration: 'idle',
    title: 'Menú en preparación',
    description: 'Este restaurante aún no tiene productos disponibles',
    cta: 'Ver otros restaurantes',
  },
  /** CategoryResultsPage sin productos. */
  emptyCategory: {
    illustration: 'noResults',
    title: 'Sin productos en esta categoría',
    description: 'Prueba con otra categoría',
    cta: 'Ver categorías',
  },
  /** NotificationsPage y popover de la campana: pestaña "sin leer". */
  notificationsUnread: {
    illustration: 'idle',
    title: 'Todo al día',
    description: 'Aquí verás tus notificaciones',
  },
  /** NotificationsPage y popover de la campana: pestaña "todas". */
  notificationsAll: {
    illustration: 'idle',
    title: 'Aún no tienes notificaciones',
    description: 'Aquí verás tus notificaciones',
  },
  /** OrdersPage sin pedidos. */
  orders: {
    illustration: 'idle',
    title: 'Aún no tienes pedidos',
    description: 'Cuando hagas tu primer pedido, aparecerá aquí',
    cta: CTA_EXPLORE,
  },
} as const satisfies Record<string, StateCopy>

export const ERROR_COPY = {
  /** Cuenta de restaurante/domiciliario sin activar (o desactivada por el admin). */
  accountInactive: {
    illustration: 'confused',
    title: 'Tu cuenta está en revisión',
    description: 'Un administrador debe activarla antes de que puedas entrar. Si crees que es un error, escríbenos',
    cta: 'Cerrar sesión',
  },
  /** ErrorBoundary (pantalla completa). */
  boundary: {
    illustration: 'sad',
    title: 'Algo salió mal',
    description: 'Intenta de nuevo en unos segundos',
    cta: 'Reintentar',
  },
  /** Carga de restaurantes: causa de red (Home y RestaurantListPage). */
  restaurantsNetwork: {
    illustration: 'sad',
    title: 'No pudimos cargar los restaurantes',
    description: 'Revisa tu conexión e intenta de nuevo',
    cta: 'Reintentar',
  },
  /** Carga de restaurantes: sesión no verificable (RLS). */
  restaurantsPermission: {
    illustration: 'sad',
    title: 'No pudimos verificar tu sesión',
    description: 'Cierra sesión y vuelve a entrar. Si sigue pasando, escríbenos',
    cta: 'Reintentar',
  },
  /** Carga de restaurantes: causa desconocida. */
  restaurantsUnknown: {
    illustration: 'sad',
    title: 'No pudimos cargar los restaurantes',
    description: 'Intenta de nuevo en un momento',
    cta: 'Reintentar',
  },
  /** RestaurantDetailPage: falla la carga del restaurante. */
  restaurantLoad: {
    illustration: 'sad',
    title: 'No pudimos cargar este restaurante',
    description: 'Revisa tu conexión e intenta de nuevo',
    cta: 'Reintentar',
  },
  /** RestaurantDetailPage: falla la carga del menú. */
  menuLoad: {
    illustration: 'sad',
    title: 'No pudimos cargar el menú',
    description: 'Revisa tu conexión e intenta de nuevo',
    cta: 'Reintentar',
  },
  /** RestaurantDetailPage: el restaurante no existe. */
  restaurantNotFound: {
    illustration: 'confused',
    title: 'No encontramos este restaurante',
    description: 'Puede que el enlace esté roto o el restaurante ya no exista',
    cta: CTA_EXPLORE,
  },
  /** RestaurantDetailPage: restaurante suspendido. */
  restaurantUnavailable: {
    illustration: 'sad',
    title: 'Restaurante no disponible',
    description: 'Este restaurante no puede recibir pedidos por ahora',
    cta: 'Volver al inicio',
  },
  /** OrderDetailPage: el pedido no existe. */
  orderNotFound: {
    illustration: 'confused',
    title: 'No encontramos este pedido',
    description: 'Puede que el enlace esté roto o el pedido ya no exista',
    cta: 'Volver a mis pedidos',
  },
  /** CheckoutPage: fallo del servidor al confirmar el pedido, por causa (LOOP_CLIENT_05C). */
  checkoutSession: {
    illustration: 'sad',
    title: 'Tu sesión expiró',
    description: 'Inicia sesión otra vez para confirmar el pedido. Tu carrito sigue guardado',
    cta: 'Iniciar sesión',
  },
  checkoutNetwork: {
    illustration: 'sad',
    title: 'No pudimos confirmar tu pedido',
    description: 'Revisa tu conexión e intenta de nuevo. Tu carrito sigue guardado',
    cta: 'Reintentar',
  },
  checkoutValidation: {
    illustration: 'sad',
    title: 'Revisa los datos de tu pedido',
    description: 'Algo de la dirección o del pago no es válido. Tu carrito sigue guardado',
    cta: 'Revisar mi pedido',
  },
  checkoutClosed: {
    illustration: 'sad',
    title: 'El restaurante no puede recibir tu pedido ahora',
    description: 'Puede que haya cerrado hace un momento. Tu carrito sigue guardado',
    cta: 'Volver a restaurantes',
  },
  checkoutCart: {
    illustration: 'sad',
    title: 'Algo cambió en tu carrito',
    description: 'Un producto ya no está disponible o una cantidad no es válida. Tu carrito sigue guardado',
    cta: 'Revisar mi carrito',
  },
  /** OrderDetailPage: el restaurante no confirmó a tiempo (cancelación automática). */
  orderTimeout: {
    illustration: 'sad',
    title: 'El restaurante no respondió a tiempo',
    description: 'No se te cobró nada. Puedes pedir de nuevo o elegir otro restaurante',
    cta: 'Pedir de nuevo',
    ctaSecondary: 'Ver restaurantes',
  },
  /** NotFound (404). El CTA depende de la sesión: "Volver al inicio" / "Iniciar sesión". */
  notFound: {
    illustration: 'confused',
    title: 'No encontramos esta página',
    description: 'Puede que el enlace esté roto o la página ya no exista',
  },
} as const satisfies Record<string, StateCopy>
