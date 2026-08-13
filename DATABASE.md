# 🗄️ BASE DE DATOS — Supabase (real)

## Estado

Desde esta versión, la app usa **Supabase real** como backend. Ya no hay datos mock en localStorage/IndexedDB (esas tablas fueron reemplazadas — ver `MIGRATION_NOTES.md`).

**Excepción:** el carrito de compras (`useCart`) sigue viviendo en `localStorage` a propósito — es estado efímero de sesión, no necesita persistir en base de datos.

## Proyecto Supabase

- **Project ID:** `eisgjtabunwnnsfyrwcx`
- **URL:** `https://eisgjtabunwnnsfyrwcx.supabase.co`
- **Región:** us-east-1

## Esquema

| Tabla | Descripción |
|---|---|
| `profiles` | Extiende `auth.users` — nombre, teléfono, rol |
| `restaurants` | Restaurantes, vinculados a `owner_id` |
| `products` | Menú de cada restaurante |
| `orders` | Órdenes con estado |
| `order_items` | Detalle de productos por orden |
| `favorites` | Restaurantes favoritos por cliente |

Todas las tablas tienen **Row Level Security (RLS)** activo: cada rol solo ve/edita lo que le corresponde.

## Variables de entorno necesarias

```
VITE_SUPABASE_URL=https://eisgjtabunwnnsfyrwcx.supabase.co
VITE_SUPABASE_ANON_KEY=<la clave anon/publishable del proyecto>
```

**Local:** ya están en `.env` (no se sube a git, está en `.gitignore`).

**Producción (Vercel):** deben configurarse en el dashboard del proyecto → Settings → Environment Variables. La clave `anon` es pública por diseño (protegida por RLS), no es un secreto — es seguro que viaje en el bundle del navegador.

## Cuentas de prueba

Ya no hay cuentas mock precargadas — los usuarios se crean registrándose de verdad en `/register`, lo cual dispara el trigger `handle_new_user` y crea el perfil automáticamente con el rol elegido.

## Datos de restaurantes sembrados

3 restaurantes y 12 productos ya están cargados directamente en la base (sin dueño asignado — se pueden vincular después a una cuenta real de restaurante).
