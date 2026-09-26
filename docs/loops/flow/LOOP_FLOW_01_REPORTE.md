# LOOP_FLOW_01 — Reporte (25-sep-2026)

**Estado:** ✅ Cerrado el 25-sep-2026. Backend y frontend en producción; QA real hecho en teléfonos (restaurante y domiciliario).

## IMPLEMENTADO
- **Datos (F1.1):** `orders.confirm_deadline`, `accept_deadline`, `cancel_reason`; `app_settings.restaurant_confirm_seconds` / `delivery_accept_seconds` (120, límites 30–900); trigger BEFORE INSERT que fija `confirm_deadline` (`create_order` intacto).
- **Vencimiento (F1.2):** `server_time()`, `private.expire_overdue_orders()`, `assign_next_driver` v2 (fija `accept_deadline`), `notify_no_delivery`; `restaurant_advance_order`, `delivery_accept_order` rechazan lo vencido (`order_expired`); `delivery_reject_order` avisa si no hay a quién reasignar.
- **Programación (F1.3):** `pg_cron` instalado; job `expire_overdue_orders` cada 15 s (verificado: ejecuciones sin fallos).
- **Frontend:** `useCountdown` (hora del servidor) + `DeadlineCountdown` (a11y: anuncia al inicio y últimos 10 s); restaurante: cuenta regresiva por pedido pendiente, sonido repetido + vibración, Wake Lock y alerta "pedido sin domiciliario"; domiciliario: cuenta regresiva en el pedido por aceptar; cliente: "Esperando confirmación…", "Buscando domiciliario…" y pantalla `ErrorState` "El restaurante no respondió a tiempo" con salidas; admin: tarjeta "Tiempos de respuesta".

## MIGRACIONES (aplicadas)
`20260925000700_f1_1_order_deadlines` · `…000710_f1_2_expire_overdue_orders` · `…000720_f1_3_schedule_expiry_cron` (cada una con `.rollback.sql`).

## CÓMO FUNCIONA EL VENCIMIENTO
El servidor guarda la hora límite en el pedido. Las RPC rechazan actuar después de esa hora; el cron cada 15 s cancela (`restaurant_timeout`) o reasigna lo vencido. Vencimiento real: entre 120 y 135 s. Nadie acepta → `ready` sin domiciliario, aviso al restaurante y admin, no se cancela.

## TESTS
- SQL (`supabase/tests/f1_expire_overdue_orders.test.sql`, transacción abortada): 12 casos en OK contra producción (conteo de pedidos 41 → 41).
- Frontend: 452 → 456 tests; `tsc`, `lint` y `build` en verde.

## DEUDA CONOCIDA
- `cancel_reason` solo se registra para `restaurant_timeout` (registrar cancelaciones manuales exige ampliar `guard_order_update`).
- El push al cliente por vencimiento dice "cancelado" a secas; el motivo lo explica la pantalla.
- Un domiciliario que se pone "En turno" después no recibe pedidos ya sin asignar (el restaurante usa "Enviar"/buscar otra vez).
- Reembolsos con pago en línea → LOOP_CLIENT_07. Mostrar efectivo y notas → 05D (sigue bloqueante para el piloto).

## QA REAL (hecho por Jorge, 25-sep)
El restaurante vio el pedido sin refrescar, con cuenta regresiva y sonido; los pedidos vencidos se cancelaron solos (`restaurant_timeout`, 3 casos verificados en la base) y la reasignación del domiciliario funcionó. Hallazgos y arreglos:
- **El sonido no sonaba** (Web Audio bloqueado hasta un toque): ahora `<audio>` con un pitido generado en memoria, desbloqueo silencioso en el primer toque y botón **"Probar sonido"**.
- **Había que refrescar a mano** (el WebSocket se duerme en segundo plano): recarga silenciosa al volver a la app, al recuperar la red, al reconectar y cada 20 s.
- **Push sin sonido en Android** con `tag` repetido: se agregó `renotify`.

### Checklist original

Restaurante no responde → a ~2 min se cancela y el cliente ve la pantalla con salidas · confirma a tiempo → no se cancela · domiciliario no acepta → pasa al otro · rechazar → pasa al otro · ninguno acepta → alerta al restaurante y "Buscando domiciliario…" al cliente · sonido y pantalla encendida · cambiar segundos en Admin surte efecto · reloj del celular desfasado.
