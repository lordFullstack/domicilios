# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Restaurante** (dueño o encargado): recibe y despacha pedidos durante el servicio, en **celular en el mostrador o tablet/pantalla fija en cocina** (ambos; confirmado). Ruido, prisa, varias tareas a la vez. Una alarma sonora y una cuenta regresiva (120 s) le exigen atender el pedido nuevo.
- **Domiciliario**: recoge y entrega. **A veces parado, a veces en la moto con soporte para el celular** (confirmado). Pantalla en exteriores, pocas miradas, botones que se toquen sin precisión. Solo ve los pedidos que el sistema le **asigna** (no hay lista de pedidos disponibles) y no ve la dirección del cliente hasta aceptar.
- **Cliente** y **admin** existen, pero esta ronda de trabajo visual es solo restaurante y domiciliario.
- Contexto: **Riohacha (La Guajira, Colombia)**; español; pagos en **efectivo** contra entrega (pago en línea, más adelante).

## Product Purpose
PWA de pedidos a domicilio para una ciudad intermedia. El servidor decide dinero, estados, asignación y plazos: el restaurante confirma el pedido, el sistema asigna automáticamente a un domiciliario "En turno", que acepta o rechaza; si nadie responde a tiempo, el pedido se cancela (restaurante) o se reasigna (domiciliario). Éxito del piloto: **2 restaurantes + 2 domiciliarios** operando un día real sin pedidos colgados, con el efectivo cuadrado al cierre.

## Positioning
Una sola app, pensada para el efectivo y para una ciudad donde el domiciliario adelanta el subtotal al restaurante de su propia base y cobra el total al cliente. Su ganancia es la tarifa de domicilio; el "Cuadre del día" lo refleja.

## Operating Context
- Pedido: pendiente → confirmado → preparando → listo → (asignado, sin aceptar) → en camino → entregado; o cancelado.
- Restaurante: cuenta regresiva por pedido pendiente, pitido repetido cada 4 s (botón "Probar sonido"), pantalla encendida (Wake Lock), nota del cliente y con cuánto paga, alerta "pedido sin domiciliario" con "Enviar" para buscar otra vez.
- Domiciliario: interruptor **En turno**, pedidos por aceptar con cuenta regresiva, Aceptar / Rechazar, GPS mientras va en camino, **Cobrar en efectivo / cambio a devolver / lo que paga al restaurante / lo que gana**, tarjeta **Cuadre del día** con su base.
- Instalada como PWA; el push depende del sistema del teléfono.

## Capabilities and Constraints
- **No cambiar comportamiento ni lógica** en este refresco: RPC del servidor, plazos, alarma, cuadre, `OrderPaymentInfo`, En turno, realtime y sondeo.
- El domiciliario **no** tiene marketplace de pedidos, ni ganancias ni distancias por pedido inventadas (no existen en el sistema). La dirección se oculta hasta aceptar.
- No hay ETA, distancias ni calificaciones por pedido para mostrar como datos reales.
- Stack existente: React 19, Vite, TypeScript, Tailwind, sistema de diseño en `docs/design-system` (COLORS, TYPOGRAPHY, CARDS, STATES, ELEVATION), ilustraciones de cohete. 549 tests y un vigilante `axe-core` deben seguir verdes; existen tests de sistema de diseño (contraste, `tabular-nums`, `hairline`).
- Cifras (COP) con `tabular-nums`; objetivos táctiles ≥ 44 px; texto de estado con la variante `strong` de success/warning.

## Brand Commitments
- Nombre: **Domicilios Riohacha**; marca de cohete (`RocketMark`) e ilustraciones existentes; primario naranja.
- **Para las pantallas de restaurante y domiciliario el usuario dio libertad total** (confirmado): pueden tener su propio mundo visual, más allá del cohete y el naranja actuales.
- Referencia que el usuario compartió (mockup, 25-sep-2026): restaurante con cabecera oscura y tarjetas de métricas (Hoy / En preparación / En camino), lista de pedidos con chips de estado y detalle con notas del cliente; domiciliario en tema oscuro con tarjeta de disponibilidad y tarjetas de pedido claras. Es una **referencia**, no un contrato: los datos que no existen en el sistema no se muestran.

## Evidence on Hand
Pantallas reales en `src/features/restaurant/` y `src/features/delivery/`; componentes compartidos en `src/shared/components/`. **No hay** fotos de restaurantes reales del piloto ni testimonios; no inventar ninguno. Sin generación de imágenes disponible: el trabajo visual es con código.

## Product Principles
1. **Lo urgente primero:** en el panel del restaurante manda el pedido que vence; en el del domiciliario, lo que debe aceptar o cobrar.
2. **Legible a distancia y con una mano:** cifras grandes, contraste alto, un solo botón principal por tarjeta.
3. **El dinero, sin ambigüedad:** cobrar, pagar al restaurante, cambio y ganancia se muestran siempre con los mismos nombres.
4. **Nunca inventar datos** que el sistema no tiene.
5. **Que se sienta hecho para este trabajo**, no una plantilla genérica de paneles.

## Accessibility & Inclusion
Estándar AA. Uso al sol y en movimiento: contraste generoso, objetivos táctiles grandes, no depender solo del color ni del sonido (la cuenta regresiva y las alertas también son texto); respetar `prefers-reduced-motion`. Tests de `axe-core` en los componentes del piloto.
