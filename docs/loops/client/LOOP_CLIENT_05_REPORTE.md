# LOOP_CLIENT_05 — Reporte (Sub-tanda 1: Seguridad)

Estado: **sub-tanda 1 CERRADA** (M1 + M2 + M3 + frontend; QA manual OK). Sub-tanda 2 movida a **LOOP_CLIENT_05C** (pendiente).
Rama: `loop/client-05-checkout`. Commit de la sub-tanda 1: `673f8a7`. Pendiente de merge a `main` tras verificar el preview.

## 1. Migraciones aplicadas a producción (una por una, con OK)

| # | Migración | Qué hace | Verificación |
|---|---|---|---|
| M1 | `20260924000100_m1_revoke_direct_order_inserts` | Elimina las policies INSERT directas de `orders` y `order_items`: los pedidos solo se crean por el RPC `create_order` | 0 policies INSERT; inserción directa bloqueada (42501); RPC OK; pedido real de punta a punta OK (#F28868AE, $8.000) |
| M2 | `20260924000200_m2_orders_client_order_id` | Columna `orders.client_order_id uuid` (null) + índice único parcial `(user_id, client_order_id) where client_order_id is not null` | Prueba 5/5; 37 pedidos existentes con llave null; guard_order_update impide que el cliente cambie la llave |
| M3 | `20260924000300_m3_create_order_idempotency` | `create_order` con 6º parámetro `p_client_order_id uuid default null`; misma llave del mismo usuario devuelve el mismo pedido; carrera resuelta con `unique_violation`; firma de 5 parámetros eliminada | 1 firma, 6 params, SECURITY DEFINER, search_path `""`, ACL authenticated + service_role (anon sin acceso); prueba real abortada: sin llave OK, llave nueva guardada, misma llave devuelve el mismo pedido; base intacta (37 pedidos, 81 items) |

Cada una tiene su `.rollback.sql` en `supabase/migrations/`. Orden de rollback: M3 → M2 → M1.
Pruebas SQL en `supabase/tests/`. Todas las pruebas de base se corrieron en transacciones abortadas.
`guard_order_update` NO se modificó (su allowlist ya protege las columnas nuevas).

## 2. Frontend

Creados:
- `src/features/client/utils/clientOrderId.ts`: `getOrCreate(sig)`, `clear()`, `generateUuid()` (fallback v4 con `getRandomValues`), `cartSignature()`.
- `src/features/client/utils/clientOrderId.test.ts`: 7 tests.

Modificados:
- `src/features/client/pages/CheckoutPage.tsx`: `inFlightRef` (try/finally) arriba del return temprano; envía `client_order_id`; `clientOrderId.clear()` tras éxito.
- `src/hooks/useLocalData.ts`: `createOrder` acepta `client_order_id?` y envía `p_client_order_id` (null si no viene).
- `src/hooks/createOrder.test.ts`: espera `p_client_order_id`; test nuevo de envío de la llave.

Firma de la llamada: `rpc('create_order', { p_restaurant_id, p_delivery_address, p_special_instructions, p_payment_method, p_items, p_client_order_id })`.

Comportamiento del UUID: sessionStorage `checkout_client_order_id` = `{id, sig}`. Misma firma del carrito (productos + cantidades) reutiliza el id, también tras recargar o reintentar tras un error; si el carrito cambia se regenera. Se limpia solo tras un pedido exitoso.

No se tocó: RPC, migraciones, `OrderSuccessView`, manejo de errores, lógica del carrito.

## 3. Verificación automática

- `tsc --noEmit` (lint): OK
- Tests: **46 archivos, 411 tests OK**
- Build: OK

## 4. Pruebas manuales del cliente

Todas OK (QA manual confirmado por el usuario):
- Pedido real tras M1, flujo de punta a punta con total del servidor (#F28868AE, $8.000).
- Pedido guarda el UUID en `orders.client_order_id`.
- Recarga durante el checkout conserva el mismo UUID.
- Doble click en "Confirmar" crea un solo pedido.
- Reintento tras error usa el mismo UUID.
- Carrito cambiado genera un UUID nuevo.
- Tras éxito, la clave se borra de sessionStorage.

## 5. Deuda: LOOP_CLIENT_05C (antes sub-tanda 2, UX) — pendiente

- Pantalla de error del checkout con ErrorState (+ copy en `stateCopy`).
- `cash_amount` (cambio): M4 columna, M6 RPC, UI.
- Notas al restaurante (≤150 caracteres): M5 columna, M6 RPC, UI.
- Verificar con un test que el trigger bloquea al cliente cambiar las columnas nuevas.
- Actualizar `docs/security/SEGURIDAD_PEDIDOS.md`.
- Fuera de este LOOP: propina (05B), dirección por defecto (06).
- Commits de la rama: `673f8a7` (código, migraciones y tests) y `db77f18` (reporte). Merge a `main` pendiente de la verificación visual en preview.
