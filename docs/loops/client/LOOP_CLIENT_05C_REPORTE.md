# LOOP_CLIENT_05C — Reporte (25-sep-2026)

**Estado:** 🟡 Base de datos en producción (M4–M7); frontend en la rama `loop/client-05c-checkout-ux`, sin merge. Falta QA manual en preview.

## IMPLEMENTADO
- **2.1 ErrorState:** el fallo del servidor al confirmar muestra una pantalla por causa (sesión, red, validación, restaurante cerrado, carrito) con su salida; "Reintentar" reutiliza la misma llave. `createOrder` devuelve el código del error. `CheckoutPage` se dividió (327 → 288 líneas) en `CheckoutError`, `PaymentMethodSelector`, `CheckoutSummary`, `CashAmountField`, `OrderNotesField`.
- **2.2 Efectivo:** campo "¿Con cuánto pagas?" (solo efectivo, opcional, cambio en vivo, error si < total). Firma de la llave ampliada (D2): restaurante + productos + método + efectivo + notas + dirección.
- **2.3 Notas:** campo con contador `n/150`; el servidor rechaza > 150 con `notes_too_long`.

## MIGRACIONES (aplicadas 25-sep-2026, cada una con OK y `.rollback.sql`)
| # | Archivo | Verificación |
|---|---|---|
| M4 | `…000800_m4_orders_cash_amount` | columna integer nullable + CHECK > 0; 47 pedidos, 0 con efectivo |
| M5 | `…000810_m5_create_order_cash_amount` | 9 casos SQL OK (transacción abortada) |
| M6 | `…000820_m6_orders_notes_to_restaurant` | columna text nullable + CHECK ≤ 150 |
| M7 | `…000830_m7_create_order_notes` | 9 casos SQL OK; una sola firma de 8 parámetros, ACL authenticated + service_role |

`guard_order_update` **no se modificó**: verificado que el cliente no puede cambiar `cash_amount` ni `notes_to_restaurant` (42501). Una app en caché con 6 o 7 argumentos sigue funcionando.

## TESTS
Frontend 456 → **500** (tipos, lint y build en verde). SQL: `supabase/tests/m5_create_order_cash_amount.test.sql` y `m7_create_order_notes.test.sql`.

## ⚠️ BLOQUEANTE ABIERTO
`cash_amount` y `notes_to_restaurant` **se guardan pero NINGUNA pantalla los muestra todavía**. **LOOP_CLIENT_05D** (mostrarlos a restaurante, domiciliario y admin) es **obligatorio antes del piloto**: sin él, el cliente cree que avisó y nadie se entera.

## ORDEN DE DESPLIEGUE
Las migraciones ya están aplicadas, así que el frontend de esta rama puede mergearse sin riesgo (envía `p_cash_amount` y `p_notes_to_restaurant`, que la RPC ya acepta).

## DEUDA
Propina (05B) · dirección por defecto (06) · pago en línea (07) · test de página que compruebe que el carrito no se vacía ante un fallo · Axe.

## QA PENDIENTE (Jorge, en preview)
Modo avión → "Reintentar" · efectivo < total deshabilita el botón · cambio en vivo · nota con contador y tope 150 · cambiar efectivo o nota tras una respuesta perdida crea llave nueva · pedido real con efectivo y nota queda guardado.
