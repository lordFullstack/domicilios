# Lista de verificación — piloto (2 restaurantes + 2 domiciliarios)

Marca cada casilla. Producción: `https://domicilios-rouge.vercel.app` · Soporte: WhatsApp 320 539 0468.

## A. Antes del día (Jorge, en casa)
**Supabase**
- [ ] Authentication → Providers → Email guardado: largo mínimo **8**, requisitos **"Lowercase, uppercase letters and digits"**, Secure password change **activado**, Require current password **desactivado**. Recargar y confirmar.
- [ ] **Respaldos:** `npm run backup` corrido con `✔ Respaldo completo y verificado` y la carpeta copiada a un segundo lugar (ver `docs/RESPALDOS.md`), o plan Pro.
- [ ] Nadie más tiene el usuario admin; contraseña de admin larga y distinta.

**Administración (Admin en la app)**
- [ ] Domiciliarios → **Tiempos de respuesta** en **120 / 120** segundos.
- [ ] Los **2 restaurantes** aprobados y con sus productos cargados (nombre, precio, foto, disponibles).
- [ ] Los **2 domiciliarios** activados (Domiciliarios → activar).
- [ ] Tarifa de domicilio definida (Domiciliarios → Tarifa de domicilio).
- [ ] Cada restaurante en **"Abierto"**.

## B. En cada teléfono (restaurantes y domiciliarios)
- [ ] App **instalada en la pantalla de inicio** (en iPhone es obligatorio para el push).
- [ ] Sesión iniciada con su cuenta; **permiso de notificaciones: permitido**.
- [ ] Volumen de **medios** alto; sin "No molestar" ni modo silencio.
- [ ] **Restaurante:** abrir el panel y tocar **"🔔 Probar sonido"**: debe sonar.
- [ ] **Domiciliario:** activar **"En turno"** y, si es su costumbre, escribir su **base** en "Cuadre del día".
- [ ] Ahorro de batería en "Sin restricciones" para la app (Android).
- [ ] El número de soporte guardado en el teléfono.

## C. Pedido de prueba completo (antes de recibir clientes reales)
Con una cuenta de cliente de prueba y **efectivo** (por ejemplo, total $30.000, pago con $50.000, nota "sin cebolla"):
- [ ] El restaurante recibe el pedido **sin refrescar**, con **cuenta regresiva y pitido**; ve la **nota** y "Paga con $50.000".
- [ ] Confirmar → Preparar → **Marcar lista** → **Enviar**.
- [ ] El domiciliario recibe la **notificación push** (app cerrada) y ve el pedido con cuenta regresiva. **No ve la dirección** hasta aceptar.
- [ ] **Aceptar**: aparece la dirección, **COBRAR EN EFECTIVO $30.000**, "Cambio a devolver: $20.000" y "Al recoger pagas al restaurante $X; ganas $Y".
- [ ] El cliente ve el avance en tiempo real y el mapa cuando va en camino.
- [ ] **Entregar**: el pedido pasa a entregado y el cuadre del día suma la entrega.

## D. Pruebas de fallo (una vez, con calma)
- [ ] **El restaurante no responde:** no tocar nada ~2 minutos → el pedido se cancela solo y el cliente ve "El restaurante no respondió a tiempo" con salidas.
- [ ] **El domiciliario no responde:** ~2 minutos → el pedido pasa al otro domiciliario.
- [ ] **Rechazar:** el primer domiciliario rechaza → pasa al otro al instante.
- [ ] **Nadie acepta:** los dos rechazan → el restaurante ve la alerta y **"Enviar"** busca otra vez; el cliente ve "Buscando domiciliario…".
- [ ] **Sin internet:** modo avión al confirmar un pedido → "Reintentar" y no se duplica al volver la red.

## E. Al cierre del día
- [ ] Cada domiciliario abre **"Cuadre del día"**: entregas, cobrado, pagado a restaurantes y **ganancia**; el efectivo en mano = **base + ganancia**.
- [ ] El admin revisa el mismo cuadre por domiciliario (Domiciliarios → detalle → "Cuadre del día").
- [ ] **Correr el respaldo del día** (`npm run backup`) y copiarlo a un segundo lugar.
- [ ] Anotar todo lo raro (hora, qué pasó, teléfono) y pasarlo a Claude.
- [ ] Si algo salió mal: no tocar la base de datos sin un respaldo hecho antes.

## F. Cuándo parar el piloto
Detener y avisar si: un pedido queda **colgado** sin restaurante ni domiciliario, el **efectivo no cuadra**, o **un pedido se duplica**. Nada de eso debería pasar; si pasa, es información valiosa y se corrige antes de seguir.

## Conocido y aceptado para el piloto
- La dirección del cliente se oculta en la pantalla, no en el servidor (los 2 domiciliarios están aprobados por el admin).
- El push en iPhone depende del interruptor de silencio, No molestar y de tener la app instalada.
- El vencimiento real de los 120 s puede tardar hasta 15 s más.
