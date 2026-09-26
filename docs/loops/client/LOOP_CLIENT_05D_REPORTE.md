# LOOP_CLIENT_05D — Reporte (25-sep-2026)

**Estado:** ✅ En producción (`eeeddf3`). Cierra el **bloqueante del piloto** abierto por 05C.

## IMPLEMENTADO
Un solo componente compartido, `src/shared/components/OrderPaymentInfo.tsx`, en cuatro lugares:
| Rol | Dónde | Qué ve |
|---|---|---|
| Restaurante | Tarjeta de cada orden activa | Nota del cliente y con cuánto paga |
| Domiciliario | Detalle del pedido | **Cobrar en efectivo** (total), con cuánto paga, cambio a devolver; luego (cuadre) lo que adelanta al restaurante y lo que gana |
| Admin | Panel de detalle del pedido | Ambos datos |
| Cliente | Detalle de su pedido | Lo que declaró |

Casos: sin monto declarado ("lleva cambio"), pago exacto ("sin cambio"), pago en línea sin nota (no renderiza nada).

## TESTS
507 tests al cerrar (7 nuevos de `OrderPaymentInfo`); `tsc`, `lint` y `build` en verde. No hubo cambios de base de datos.

## FUERA DE ALCANCE / DEUDA
Ocultar la dirección del cliente en el servidor hasta que el domiciliario acepte (vista segura); propina (05B); dirección por defecto (06).
