# Estado del proyecto — Domicilios Riohacha

**Actualizado:** 26-sep-2026 · **Producción:** `main` en Vercel (`domicilios-rouge.vercel.app`) + Supabase `eisgjtabunwnnsfyrwcx`
**Objetivo actual:** piloto con **2 restaurantes + 2 domiciliarios**. Avance estimado: ~83%.
> Historial anterior: `docs/loops/LOOP_00_5_CHECKPOINT.md` (este archivo era ese checkpoint).

## Hecho y en producción
| Bloque | Qué resolvió | Reporte |
|---|---|---|
| CLIENT_05 (M1–M3) | Sin inserts directos; idempotencia del checkout (`client_order_id`) | `loops/client/LOOP_CLIENT_05_REPORTE.md` |
| SECURITY_00/00b | Nadie se vuelve admin; domiciliarios y restaurantes nuevos requieren aprobación | `loops/security/LOOP_SECURITY_01_REPORTE.md` |
| SECURITY_01 | Transiciones de pedido por RPC del servidor, asignación atómica, Aceptar/Rechazar, turno; UPDATE directo revocado | `loops/security/LOOP_SECURITY_01_REPORTE.md` |
| SECURITY_02 | Push desde el servidor; `send-push` v5 solo acepta `{notification_id}` | `loops/security/LOOP_SECURITY_02_REPORTE.md` |
| FLOW_01 | Plazos de 120 s (configurables), cancelación por `restaurant_timeout`, reasignación, "sin domiciliario"; alarma con sonido | `loops/flow/LOOP_FLOW_01_REPORTE.md` |
| CLIENT_05C | Error del checkout por causa, efectivo (`cash_amount`), notas (150) | `loops/client/LOOP_CLIENT_05C_REPORTE.md` |
| CLIENT_05D | Efectivo y notas visibles a restaurante, domiciliario, admin y cliente | `loops/client/LOOP_CLIENT_05D_REPORTE.md` |
| Cuadre diario | Tarjeta "Cuadre del día" (domiciliario y admin); perfil ya no inventa ganancias | commit `f39f110` |
| Política de contraseñas | 8+, mayúsculas/minúsculas/números y comprobación de filtraciones (app) | commit `2e2618f` |

## Pendiente antes del piloto
| # | Bloque | Quién | Estado |
|---|---|---|---|
| 1 | Guardar política de contraseñas en Supabase (Auth → Providers → Email) | Jorge | ⏳ |
| 2 | **Respaldos:** decidir Pro o script de exportación | Jorge | ⏳ |
| 3 | Contacto de soporte (WhatsApp) visible en paneles | Jorge + Claude | ⏳ |
| 4 | Accesibilidad / Lighthouse | Claude | ⏳ |
| 5 | Día de prueba real (2 restaurantes, 2 domiciliarios) | Jorge | ⏳ |

## Después del piloto (decidido)
- **05B** propina · **06** dirección por defecto · **07** pago en línea (con reembolsos por cancelación automática).
- **Tarifa por distancia** (admin define tramos de km; requiere coordenadas y cálculo en servidor).
- **Rediseño visual** de restaurante y domiciliario (mockup del 25-sep; choca con decisiones: sin marketplace de pedidos ni ganancias/distancias por pedido).
- **Vista segura de dirección:** hoy la dirección del cliente se oculta solo en la interfaz hasta que el domiciliario acepta; el servidor devuelve la fila completa. Aceptado para el piloto (2 domiciliarios aprobados por el admin).
- Botón de "Cuadrado" con historial (hoy el cuadre es un reporte).

## Reglas de trabajo
Una migración a la vez y solo con OK; pruebas en transacción abortada; commit y merge solo cuando Jorge lo pide; rutas `/qa/*` y `.env.local` temporales se eliminan al terminar.

## Cifras
61 archivos / 524 tests (vitest) · `tsc`, `lint` y `build` en verde · 47 pedidos en la base (pruebas incluidas).
