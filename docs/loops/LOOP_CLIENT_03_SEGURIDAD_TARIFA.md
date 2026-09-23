# LOOP_CLIENT_03 — Anexo: seguridad de pedidos + tarifa de domicilio

Ver `docs/security/SEGURIDAD_PEDIDOS.md` para BD.

## Frontend
- Checkout crea el pedido con `supabase.rpc('create_order')`: solo manda producto + cantidad. El total mostrado al terminar es el del servidor.
- Errores de la RPC traducidos a copy (`createOrderErrorMessage` en `hooks/useLocalData.ts`).
- `useDeliveryFee` (shared/hooks): lee `app_settings` una vez por sesión (caché de módulo), `null` si falla (nunca promete "Gratis" sin saberlo).
- `DeliveryFeeRow`: línea "Envío" en Carrito y Checkout (Gratis / valor / "Se calcula al confirmar"). Total = subtotal + tarifa.
- "Envío gratis" hardcodeado reemplazado por la tarifa real en tarjeta de restaurante y hero.
- Detalle de pedido: línea de envío para cliente (OrderSummaryCard), domiciliario ("Tu tarifa de domicilio") y admin, solo si > 0.
- Admin → Domiciliarios: tarjeta "Tarifa de domicilio" con validación 0–100.000, confirmación y aviso de que no cambia pedidos existentes.

## Archivos
Nuevos: shared/hooks/useDeliveryFee.ts (+test), features/client/components/DeliveryFeeRow.tsx, features/admin/components/DeliveryFeeCard.tsx, features/admin/hooks/useDeliveryFeeSettings.ts, hooks/createOrder.test.ts, docs/security/*.
Modificados: hooks/useLocalData.ts (createOrder), shared/types (Order.delivery_fee), CheckoutPage, CartPage, RestaurantGridCard, RestaurantHero, OrderSummaryCard, OrderDetailPage, DeliveryOrderDetailSheet, admin OrderDetailPanel, admin DeliveryPeoplePage, 2 tests (mock de tarifa).

## Tests
Build OK · tsc OK · 23 archivos / 136 tests (antes 21 / 129) · 0 warnings.

## Deuda
- Reportes de restaurante/admin suman `total` como ventas: desde ahora incluye la tarifa del domiciliario. Separar en LOOP 14 (Finanzas).
- El domiciliario no ve aún sus ganancias (suma de `delivery_fee`); el dato ya existe.
- CheckoutPage 318 líneas (preexistente > 300).
