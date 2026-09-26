# Respaldos (plan gratuito de Supabase)

El plan gratuito **no hace respaldos automáticos descargables**. Este script los suplanta: descarga los datos y los guarda en tu equipo. **Pasar al plan Pro** sigue siendo la opción más segura (respaldos diarios, restauración completa, protección de contraseñas filtradas).

## Cuándo correrlo
- **Todos los días al cerrar** durante el piloto (toma menos de un minuto).
- **Siempre antes** de tocar la base de datos (migraciones, arreglos a mano, borrar cosas).

## Cómo correrlo (Windows, PowerShell, en la carpeta del proyecto)
1. Supabase → **Project Settings → API** → copia la clave **`service_role`** (la secreta). Es como la contraseña maestra de la base: **no la pegues en el chat, en WhatsApp ni en archivos del proyecto**.
2. En PowerShell (vale solo para esa ventana; al cerrarla desaparece):
   ```powershell
   $env:SUPABASE_SERVICE_ROLE_KEY = "PEGA_AQUI_LA_CLAVE"
   npm run backup
   ```
3. Debe terminar con `✔ Respaldo completo y verificado en backups\AAAA-MM-DD_HHMMSS`. Si termina con `✖`, **no lo des por bueno**: cópiame el mensaje.
4. **Copia esa carpeta a un segundo lugar** (disco externo o nube privada). Un respaldo que vive solo en el mismo computador no protege de un daño o robo del equipo.

## Qué guarda
Las 12 tablas de la aplicación (`profiles`, `restaurants`, `products`, `promotions`, `orders`, `order_items`, `order_assignment_attempts`, `order_ratings`, `notifications`, `favorites`, `push_subscriptions`, `app_settings`) y la lista de usuarios de Auth (`auth_users.json`: correo, fechas, metadatos).
Cada ejecución verifica que las filas descargadas coincidan con las que informa la base y escribe `manifest.json` con sumas de control (SHA-256). Conserva los últimos 30 respaldos (`--keep N` lo cambia).

## Qué NO guarda (límites honestos)
- **Contraseñas de los usuarios:** Supabase no las expone. Si hubiera que restaurar desde cero, cada persona tendría que usar "Olvidé mi contraseña".
- **Fotos** de restaurantes, productos y perfiles (Storage): están en Supabase Storage y este script no las descarga.
- **Funciones, políticas de seguridad (RLS) y triggers:** ya están versionados en `supabase/migrations/` del repositorio; con eso se reconstruye la estructura.
- Es una copia **lógica** de los datos: sirve para recuperar información y auditar, pero restaurarla exige un procedimiento cuidadoso (pídemelo antes de intentarlo).

## Seguridad
- Los respaldos contienen **nombres, teléfonos, correos y direcciones**. La carpeta `backups/` está en `.gitignore`, así que **no se sube a git**; no la subas a ningún otro sitio público.
- No dejes la clave `service_role` guardada en el equipo. Si crees que se filtró: Supabase → Project Settings → API → regenerar.

## Restauración (solo emergencias)
1. **No restaures encima de datos que siguen sanos.** Primero haz un respaldo del estado actual.
2. Los archivos JSON se cargan en este orden (por las llaves foráneas): `profiles` → `restaurants` → `products` → `promotions` → `orders` → `order_items` → `order_assignment_attempts` → `order_ratings` → `notifications` → `favorites` → `push_subscriptions` → `app_settings`.
3. Los usuarios de Auth deben existir antes que `profiles`; sus contraseñas se restablecen por correo.
4. Pídeme el script de restauración en ese momento y con el caso concreto: hacerlo a ciegas es más peligroso que la pérdida que quiere reparar.

## Alternativa de fidelidad completa (opcional)
Con la CLI de Supabase y la contraseña de la base: `supabase db dump` genera un volcado SQL completo (incluida la estructura). Requiere instalar la CLI y usar la conexión directa; no está automatizado aquí.
