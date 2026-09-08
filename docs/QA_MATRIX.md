# LOOP 20 — Matriz de QA

No hay Playwright/Cypress instalado (ver `LOOP_STATUS.md` de este LOOP para
la justificación). Esta matriz documenta los casos que hoy se prueban a
mano, flujo por flujo, hasta que se decida invertir en E2E automatizado.

Leyenda: ✅ probado y funciona · ⚠️ funciona con matices (ver nota) · ❌ no
soportado / fuera de alcance del backend actual.

---

## Cliente: Explorar → restaurante → producto → carrito → checkout → pedido → tracking

| Caso | Estado | Nota |
|---|---|---|
| Happy path completo | ✅ | Probado end-to-end en LOOPs 02-06 |
| Buscar sin resultados | ✅ | `EmptyState` con "Limpiar filtros" |
| Restaurante cerrado | ✅ | CTA deshabilitado, badge "Cerrado" |
| Producto agotado | ✅ | No se puede agregar, badge visible |
| Carrito con productos de otro restaurante | ✅ | Confirmación "Vaciar y agregar" |
| Checkout sin dirección | ✅ | Botón deshabilitado hasta completarla |
| Checkout offline | ✅ | Bloqueado con aviso, carrito se conserva |
| Doble tap en "Confirmar pedido" | ✅ | Guard `submitState === 'submitting'` + botón disabled |
| Pedido cancelado (visto desde tracking) | ✅ | Banner rojo, sin timeline activo |
| Datos inválidos en dirección (muy corta) | ✅ | Validación mínima 5 caracteres |
| Reordenar con producto ya no disponible | ✅ | Se salta, avisa cuántos se agregaron/omitieron |
| ETA de entrega | ❌ | No existe ese campo en el backend (LOOP 06) |

## Domiciliario: login → pedidos → aceptar → recoger → camino → entregar

| Caso | Estado | Nota |
|---|---|---|
| Happy path completo | ✅ | Probado en LOOP 07 |
| Dos domiciliarios aceptan el mismo pedido a la vez | ✅ | `acceptOrder` con guard `is('delivery_person_id', null)` |
| Doble tap en aceptar/completar | ✅ | Guard `processingOrderId` |
| Pérdida de conexión al aceptar/completar | ✅ | Bloqueado con aviso, no confirma en falso |
| Pedido cancelado mientras está "en camino" | ✅ | Desaparece de "Mi entrega actual" automáticamente (realtime) |
| Ubicación sin permiso del navegador | ✅ | Aviso claro, no rompe la pantalla |
| Rechazar un pedido puntual | ❌ | No existe ese mecanismo en el backend (LOOP 07) |

## Admin: login → dashboard → restaurantes → menú → pedidos → reportes

| Caso | Estado | Nota |
|---|---|---|
| Happy path completo | ✅ | Probado en LOOPs 08-14 |
| Filtros combinados (periodo + restaurante + estado + búsqueda) | ✅ | Probado en Pedidos, Restaurantes, Clientes |
| Cambiar estado de un pedido con conflicto de concurrencia | ✅ | `updateOrderSafely` detecta y avisa si cambió mientras tanto |
| Aprobar/suspender restaurante | ✅ | Con confirmación destructiva |
| Eliminar producto con pedidos asociados | ✅ | Bloqueado por FK, mensaje claro (antes mentía — bug corregido en LOOP 10) |
| Exportar CSV con periodo vacío | ✅ | Botón deshabilitado si no hay filas |
| Acceso de un rol no-admin a rutas `/admin/*` | ✅ | Bloqueado por `ProtectedRoute` + RLS |
| Crear restaurante desde Admin | ❌ | Bloqueado por RLS a propósito — es del dueño (LOOP 09) |

---

## Permisos (todos los roles)

Confirmado por auditoría de RLS (LOOPs 06, 09-14, 17), no por test automatizado:

- Un cliente no puede leer/modificar pedidos de otro cliente.
- Un restaurante no puede editar productos de otro restaurante.
- Un domiciliario no puede tomar un pedido ya asignado a otro.
- Ningún rol puede autoasignarse `admin` al registrarse (whitelist en el trigger `handle_new_user`).

## Deuda técnica reconocida

- Sin tests automatizados de integración/E2E — ver `LOOP_STATUS.md`.
- Cobertura real: 2.1% de statements (solo utilidades puras + 3 componentes
  de presentación). Hooks con llamadas a Supabase, páginas completas y
  flujos de varios pasos no tienen test automatizado todavía.
- Esta matriz depende de que un humano la ejecute — no se re-valida sola
  en cada cambio.
