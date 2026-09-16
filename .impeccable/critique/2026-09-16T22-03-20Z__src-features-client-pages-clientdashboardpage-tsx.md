---
target: ClientDashboardPage.tsx (Home cliente)
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\client\\pages\\ClientDashboardPage.tsx"
target_fingerprint: "sha256:feb903f2d14f85fa05b82f32a794c6e9213429ee85766e0e960b282b557de5df"
target_path: "C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\client\\pages\\ClientDashboardPage.tsx"
timestamp: 2026-09-16T22-03-20Z
slug: src-features-client-pages-clientdashboardpage-tsx
---
# Critique: ClientDashboardPage.tsx (Home del cliente, `/app/home`)

Method: dual-agent (A: design-review subagent · B: detector + live-browser subagent), isolated and run in parallel.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | El pill de ubicación parece tappable (icono, aria-label, chevron) pero no tiene `onClick` — no da feedback de nada. |
| 2 | Match System / Real World | 3 | Copy local y natural, pero "Restaurantes cerca de ti" se muestra igual aunque la ubicación resuelta sea otra ciudad. |
| 3 | User Control and Freedom | 1 | No hay forma de cambiar la ubicación desde Home; el buscador es un botón, no un input real. |
| 4 | Consistency and Standards | 3 | Buen sistema interno: `rounded-2xl`, `shadow-card`, `active:scale-[0.98]`, `touch-target`/`focus-ring` aplicados de forma consistente. |
| 5 | Error Prevention | 2 | Hay retry en error de carga de restaurantes, pero nada previene mostrar el grid completo cuando la ubicación cae fuera de Riohacha. |
| 6 | Recognition Rather Than Recall | 3 | Chips con emoji+label, progreso de pedido activo, total de carrito siempre visible. |
| 7 | Flexibility and Efficiency | 2 | Sin acceso rápido a "recientes"/"reordenar"/favoritos desde Home, pese a ser pantalla de uso diario. |
| 8 | Aesthetic and Minimalist Design | 3 | Flujo header→buscador→hero→categorías→pedido activo→promos→grid, sin ruido visual evidente. |
| 9 | Error Recovery | 2 | `EmptyState` con retry existe, pero no explica la causa real del fallo. |
| 10 | Help and Documentation | 1 | Cero onboarding en la primera pantalla que ve un usuario nuevo tras registrarse. |
| **Total** | | **22/40** | **Aceptable — mejoras significativas necesarias antes de que los usuarios queden conformes** |

## Design Specificity Verdict

**Mixta: el contenido es local y real, pero el sistema visual es una plantilla azul genérica de SaaS.**

- A favor: datos reales y locales — "pa comer express", "Pa tomar", copy costeño ("aprovecha ya", "3 veces mas refrescante"), y `useLocationLabel.ts` documenta explícitamente que "la app hoy solo cubre Riohacha".
- En contra: la paleta (`tailwind.config.ts`, `design-system/tokens/colors.ts`) es azul eléctrico/slate tipo fintech, sin ningún rasgo caribeño/Guajira. Las categorías (Pizza, Burgers, Sushi, Postres, Bebidas, Asados) no incluyen mariscos/pescado pese a ser una ciudad costera — una oportunidad barata de identidad local que no se tomó.
- **Bug en vivo que socava la premisa "solo Riohacha"**: la captura de pantalla autenticada mostró literalmente **"Entregar en Medellín, Antioquia"** — la geolocalización no valida contra el área de servicio real de la app.

**Escaneo determinístico**: el detector (`impeccable detect --json`) corrió limpio sobre `ClientDashboardPage.tsx` y todos sus componentes (`src/features/client/components`, `src/shared/components`, `src/design-system`) — **0 hallazgos, exit code 0**. Esto confirma que los problemas reales de esta pantalla son semánticos/de producto (botón sin `onClick`, falta de validación de zona de cobertura, sobrecarga cognitiva), no violaciones mecánicas de reglas HTML/CSS — el tipo de cosas que un linter de diseño no puede atrapar pero un usuario sí sufre.

**Evidencia de navegador**: sesión autenticada real confirmada en una pestaña nueva; capturas de fold y scroll disponibles. `read_page` detectó **3 botones interactivos sin nombre accesible** (tarjetas de promo/restaurante y su ícono de favorito hermano) — hallazgo adicional que el review de diseño no había señalado explícitamente. También se marcaron como candidatos a bajo contraste (sin medir ratio exacto): el subtítulo gris "Tu comida, más cerca" sobre header blanco, textos gris claro sobre las tarjetas de promo oscuras, y metadatos ("4.9 (7)", "Nuevo") en gris sobre blanco. La inyección del overlay `detect.js` falló como se esperaba (el dominio de producción no sirve ese script; devolvió el `index.html` de fallback del SPA con MIME type incorrecto) — no hay overlay visual que mostrar, se reporta como señal de fallback, no un overlay real.

## Overall Impression

La bienvenida funciona ("¡Hola, jose! 👋 ¿Qué quieres comer hoy?") y el `ActiveOrderCard` con barra de progreso es genuinamente tranquilizador. Pero la pantalla apila nueve secciones distintas de decisión en un solo scroll sin divulgación progresiva, y el problema más grave no es visual sino de confianza de producto: un control que aparenta ser interactivo (el selector de ubicación) no hace nada, en una app de una sola ciudad que ya demostró en vivo que puede mostrar silenciosamente la ciudad equivocada. La mayor oportunidad es resolver esa desconexión entre "lo que la UI promete" y "lo que el código hace" antes de pulir el resto.

## What's Working

1. **Skeletons que igualan la geometría real** (`RestaurantCardsSkeleton` vs `RestaurantGridCard`, mismo `aspect-[4/3]`) — cero salto de layout al cargar datos, una decisión deliberada y poco común.
2. **`ActiveOrderCard` como superficie de estado persistente** — convierte Home en un lugar donde también se seguiría un pedido en curso, no solo se navega, reduciendo la ansiedad típica de "¿mi pedido sí se hizo?".
3. **Disciplina de touch-target/focus-ring** — `.touch-target` (48×48 min) y `.focus-ring:focus-visible` aplicados casi en todos los elementos interactivos (favoritos, nav, categorías, campana de notificaciones), higiene de accesibilidad móvil por encima del promedio para este tipo de app.

## Priority Issues

- **[P0] El pill de ubicación es un adorno sin función, en una app de una sola ciudad que ya mostró la ciudad equivocada.**
  - **Por qué importa**: `HomeHeader.tsx` renderiza un botón con `aria-label`, ícono de pin y chevron — todo grita "tócame para cambiar" — pero no tiene `onClick`. Combinado con que `useLocationLabel` resuelve GPS/IP sin validar contra el área de cobertura (confirmado en vivo: mostró "Medellín, Antioquia"), un usuario fuera de Riohacha ve el mismo catálogo de restaurantes sin ninguna advertencia ni forma de corregirlo.
  - **Fix**: conectar el pill a una hoja de confirmación/cambio de ubicación, y mostrar un estado explícito "no entregamos en tu zona todavía" cuando la ubicación resuelta caiga fuera de Riohacha, en vez de servir el mismo grid.
  - **Suggested command**: `/impeccable harden` (o `/impeccable clarify` para el mensaje de error).

- **[P1] Sin divulgación progresiva: nueve secciones de decisión apiladas en un solo scroll.**
  - **Por qué importa**: header, buscador, hero, categorías, pedido activo, dos carruseles de promos y el grid completo de restaurantes rompen la regla de "una cosa a la vez" y "≤4 opciones visibles"; para un usuario con hambre que quiere resolver rápido, es mucho que procesar antes de llegar a la lista real.
  - **Fix**: considerar priorizar hero + categorías + top 4 restaurantes sobre el pliegue, revelando promos/grid completo al hacer scroll o en una pestaña secundaria — sobre todo porque `RestaurantsGrid` y `FeaturedSection` duplican el mismo trabajo de "explorar restaurantes".
  - **Suggested command**: `/impeccable layout`.

- **[P2] El buscador es un botón disfrazado de input, sin traspaso de intención.**
  - **Por qué importa**: `SearchBar.tsx` navega a la lista de restaurantes al tocarlo, sin pasar ningún query — el usuario que espera escribir de inmediato pierde su intención de búsqueda.
  - **Fix**: como mínimo, suavizar la apariencia (que no invite a escribir si no puede recibir texto), o mejor, convertirlo en un campo real que lleve el texto a la siguiente pantalla.
  - **Suggested command**: `/impeccable clarify`.

- **[P2] Fila de categorías con 6 ítems y accesibilidad de nombres incompleta.**
  - **Por qué importa**: `CategoryScroller` muestra las 6 categorías en una fila horizontal continua, por encima de la guía de ~4 elementos por grupo, y "Asados" solo aparece tras hacer scroll horizontal sin una señal clara de que hay más contenido. Además, el detector de navegador encontró **3 botones interactivos sin nombre accesible** (tarjetas de promo/restaurante y su ícono de favorito hermano) — un lector de pantalla no anunciaría nada útil ahí.
  - **Fix**: agrupar en 2 filas de 3, dejar la última tarjeta visiblemente cortada para insinuar scroll, y añadir `aria-label` a los botones sin nombre detectados.
  - **Suggested command**: `/impeccable audit` (accesibilidad) seguido de `/impeccable layout`.

- **[P3] El scroll termina de forma plana, sin cierre.**
  - **Por qué importa**: el grid de restaurantes no tiene CTA de cierre ni señal de "cargar más"; el scroll simplemente se detiene, un remate débil (regla peak-end) después de un hero y promos visualmente apetitosos.
  - **Fix**: agregar un CTA ligero al final ("Ver todos los restaurantes de Riohacha →").
  - **Suggested command**: `/impeccable delight`.

## Persona Red Flags

**Jordan (primera vez)**: Llega a una pantalla sin ningún onboarding — no se explica qué significa la insignia "Envío gratis" (solo se infiere, nunca se declara), y hay tres entradas distintas para "explorar" (buscador, hero, categorías) sin diferenciación para alguien nuevo. Tampoco tiene forma de saber que el pill de ubicación es relevante o que está roto — si su ubicación resuelta es incorrecta, simplemente asumirá que la app funciona en todas partes y se confundirá después, en checkout o al no poder recibir el pedido.

**Casey (usuario móvil distraído)**: El botón de ubicación muerto es exactamente el tipo de interacción que un usuario distraído prueba una vez, no recibe respuesta, y sigue de largo — erosionando confianza sin ningún error visible. Los dos carruseles de promos rotan automáticamente cada 5s; para alguien que hace scroll rápido y se detiene a medio leer, el contenido se mueve debajo de sus dedos.

**Persona específica del proyecto — usuario geográficamente desincronizado**: dado que la app es explícitamente de una sola ciudad, un escenario local realista es un residente de Riohacha cuyo GPS falla momentáneamente (común en dispositivos Android de gama baja/media, frecuentes en La Guajira) y cae a geolocalización por IP, que puede resolver a otro departamento — como se observó en vivo con "Medellín, Antioquia". Este usuario recibe una Home completamente poblada y aparentemente normal para una ciudad donde el servicio no opera, sin que la app revele el desajuste en ningún momento. No es un edge case hipotético: ya ocurrió durante esta auditoría.

## Minor Observations

- El emoji de hamburguesa en el hero banner reemplaza una foto de stock pendiente (comentario en el propio código) — deuda de asset, no una decisión final.
- La insignia "🔥 Oferta" está hardcodeada (no viene del modelo `Promotion` real) — todas las promos muestran la misma insignia sin importar el tipo, lo cual puede confundir a alguien pensando que un anuncio "Nuevo" es un descuento.
- El badge de notificaciones usa `text-[10px]` — muy pequeño para números de dos dígitos ("9+"), vale la pena agrandarlo dado el público objetivo con dispositivos variados.
- "Restaurantes" en el bottom nav es funcionalmente redundante con el grid + buscador + categorías de Home — tres caminos paralelos a la misma lista sin diferenciación clara de propósito.
- Candidatos a bajo contraste (no medidos, solo observados): subtítulo gris del header sobre fondo blanco, textos grises sobre tarjetas de promo oscuras, y metadatos ("4.9 (7)", "Nuevo") en gris claro sobre blanco.

## Questions to Consider

- Si el propio comentario del código dice "la app hoy solo cubre Riohacha", ¿por qué la resolución de ubicación (GPS → IP → fallback) nunca se valida contra esa restricción?
- ¿"Restaurantes cerca de ti" es una afirmación honesta en cualquier lugar donde el pill pueda resolver fuera de Riohacha, o el lenguaje de proximidad se usa de forma decorativa?
- Dada la identidad de Riohacha como ciudad costera en territorio Wayuu, ¿la paleta azul/slate actual y el set de categorías genérico fueron una elección deliberada, o una plantilla que nunca se revisó para este mercado específico?
