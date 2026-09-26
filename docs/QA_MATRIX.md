# Matriz de QA — actualizada 26-sep-2026

No hay Playwright/Cypress. Esta matriz documenta lo que se prueba a mano (y con qué tests automáticos
se respalda) hasta que se decida invertir en E2E. Estado actual: 61 archivos / 524 tests unitarios y
de componentes; las pruebas de base de datos viven en `supabase/tests/` (transacción abortada).

Leyenda: ✅ probado y funciona · ⚠️ funciona con matices · ❌ no soportado / fuera de alcance.

---

## Cliente: explorar → carrito → checkout → pedido → seguimiento
| Caso | Estado | Nota |
|---|---|---|
| Happy path completo | ✅ | |
| Buscar sin resultados · restaurante cerrado · producto agotado · carrito de otro restaurante | ✅ | `EmptyState` / badges / confirmación "Vaciar y agregar" |
| Checkout sin dirección u offline | ✅ | Errores en línea; el botón lo comunica; carrito se conserva |
| Doble tap en "Confirmar pedido" | ✅ | `inFlightRef` + botón deshabilitado + `client_order_id` (idempotencia en servidor) |
| **Fallo del servidor al confirmar** | ✅ | `ErrorState` por causa (sesión, red, validación, cerrado, carrito); "Reintentar" reutiliza la llave |
| **Efectivo: "¿con cuánto pagas?"** | ✅ | Opcional, cambio en vivo; el servidor exige ≥ total (`invalid_cash_amount`) |
| **Nota al restaurante** | ✅ | Tope 150 con contador; el servidor rechaza más (`notes_too_long`) |
| Cambiar efectivo o nota tras respuesta perdida | ✅ | Otra firma → otra llave → pedido nuevo |
| **Restaurante no responde en 120 s** | ✅ | Cancelación `restaurant_timeout`; pantalla "no respondió a tiempo" con salidas |
| **Pedido listo sin domiciliario** | ✅ | "Buscando domiciliario…" |
| Cancelar (pending/confirmed) | ✅ | RPC `client_cancel_order` |
| Reordenar con producto no disponible | ✅ | Se salta y avisa |
| ETA de entrega | ❌ | No existe en el backend |

## Restaurante
| Caso | Estado | Nota |
|---|---|---|
| Recibir pedido sin refrescar | ✅ | Realtime + recarga al volver a la app y cada 20 s |
| Cuenta regresiva, sonido repetido y pantalla encendida | ✅ | Audio con `<audio>` + botón "Probar sonido"; Wake Lock |
| Confirmar → preparar → lista → **Enviar** (asignación automática) | ✅ | RPC del servidor; rechaza si venció (`order_expired`) |
| Cancelar hasta "lista" | ✅ | Libera al domiciliario asignado |
| Ver nota del cliente y con cuánto paga | ✅ | `OrderPaymentInfo` |
| Alerta y "buscar otra vez" si nadie aceptó | ✅ | |
| Cuenta sin aprobar | ✅ | Aviso "en revisión"; no aparece a clientes |

## Domiciliario
| Caso | Estado | Nota |
|---|---|---|
| Interruptor **En turno** | ✅ | Solo en turno recibe pedidos |
| Pedido asignado con cuenta regresiva; **Aceptar / Rechazar** | ✅ | Rechazar reasigna al instante; sin respuesta → reasigna a los 120 s |
| Dos domiciliarios / doble tap | ✅ | Asignación atómica (`SKIP LOCKED` + índice único) |
| Un pedido en camino a la vez | ✅ | `delivery_busy` |
| Ver dirección antes de aceptar | ⚠️ | Oculta en la interfaz; el servidor aún devuelve la fila (deuda aceptada para el piloto) |
| Cobrar en efectivo, cambio y lo que paga al restaurante | ✅ | `OrderPaymentInfo` |
| **Cuadre del día** con su base | ✅ | Base guardada solo en el teléfono |
| Ubicación GPS sin permiso | ✅ | Aviso, no rompe la pantalla |
| Cuenta nueva sin aprobar | ✅ | Pantalla "cuenta en revisión" hasta que el admin la active |

## Admin
| Caso | Estado | Nota |
|---|---|---|
| Filtros, reportes, exportar CSV | ✅ | |
| Aprobar / suspender restaurante; activar domiciliario | ✅ | Con confirmación |
| Cambiar los tiempos de respuesta | ✅ | Tarjeta "Tiempos de respuesta" (30–900 s) |
| Ver efectivo, notas y cuadre por domiciliario | ✅ | |
| Editar cualquier pedido | ⚠️ | Por diseño el admin no tiene restricciones |
| Acceso de otro rol a `/admin/*` | ✅ | `ProtectedRoute` + RLS |

## Seguridad (verificada en base real, transacción abortada)
- Nadie sin rol admin cambia `role`, `active`, `approved` ni columnas de dinero (`guard_profile_update`, `guard_restaurant_write`, `guard_order_update`).
- Un cliente **no puede** crear pedidos insertando directo, ni modificar `total`, `cash_amount`, `notes_to_restaurant` ni `client_order_id`.
- Solo `authenticated` y `service_role` ejecutan las RPC; `send-push` solo acepta `{notification_id}`.
- Contraseñas: 8+ con mayúsculas, minúsculas y números; comprobación de filtraciones en la app (la del servidor es del plan Pro).

## Deuda técnica reconocida
- Sin E2E automatizado: esta matriz depende de que una persona la ejecute.
- Cobertura de código no re-medida desde el 2.1% antiguo; hoy hay 524 tests, la mayoría de lógica y componentes.
- Auditoría de accesibilidad y Lighthouse pendientes.
