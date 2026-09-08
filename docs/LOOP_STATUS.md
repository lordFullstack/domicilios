# LOOP 00.5 — CHECKPOINT

**Estado:** COMPLETED (adaptado — ver nota de alcance)

**Nota de alcance:** el LOOP original mencionaba una "juguería" apareciendo
en la categoría "Asados" y cambio de contexto entre restaurantes/roles.
Ese contenido pertenece a JugoClub (el otro proyecto de Jorge), no a
"pa comer express", que es single-tenant (un solo restaurante real,
"Asados"). Por indicación explícita de Jorge, se auditó identidad/roles/
perfiles/cuenta de ESTE proyecto, sin construir nada relacionado a
jugerías o multi-restaurante.

## Auditoría

- **Identidad:** OK. `AuthContext` único, sin duplicados. `profiles.role`
  es un valor fijo por usuario — no hay multi-rol ni multi-restaurante por
  dueño en el schema.
- **Roles:** OK. 4 roles reales (`client`, `restaurant`, `delivery`,
  `admin`), enforced en `ProtectedRoute` vía `allowedRoles`.
- **Restaurante:** OK. `CreateRestaurantPage` se renderiza inline dentro
  del Dashboard cuando el dueño todavía no tiene restaurante — no está
  huérfana, está bien conectada.
- **Perfil:** Ver hallazgos abajo (Cliente no tenía nada; Restaurante no
  tenía "Cuenta"; Domiciliario ya tenía perfil pero sin confirmación de
  logout).
- **Logout:** Ver hallazgos.
- **Categorías:** Auditadas end-to-end, sin bugs (ver matriz abajo).
- **Filtros:** OK, mismos IDs/slugs reales que las categorías.
- **RLS:** Revisada (no modificada). Restaurantes: solo el dueño puede
  crear/subir imágenes; Admin solo puede aprobar/suspender/editar texto.

## Problema "Juguería → Asados"

**No aplica a este proyecto.** No existe ninguna juguería en la base de
datos ni en el código. Se verificó que las categorías (`RESTAURANT_CATEGORIES`)
se resuelven siempre por `value`/slug real, nunca por índice de array:

| UI (botón) | Slug real | Query | Resultado esperado | Estado |
|---|---|---|---|---|
| 🍕 Pizza | `Pizza` | `useProductsByCategory('Pizza')` → `.eq('restaurant.category', 'Pizza')` | Productos de restaurantes categoría Pizza | ✅ Correcto |
| 🍔 Burgers | `Burgers` | ídem | Productos de restaurantes categoría Burgers | ✅ Correcto |
| 🍣 Sushi | `Sushi` | ídem | Productos de restaurantes categoría Sushi | ✅ Correcto |
| 🍰 Postres | `Postres` | ídem | Productos de restaurantes categoría Postres | ✅ Correcto |
| 🥤 Bebidas | `Bebidas` | ídem | Productos de restaurantes categoría Bebidas | ✅ Correcto |
| 🍗 Asados | `Asados` | ídem | Solo "Asados" (el único restaurante hoy) | ✅ Correcto |

`product.category` (Entradas/Platos/Bebidas/Postres/Adicionales, usado en
las pestañas del menú dentro de un restaurante) es una taxonomía **distinta**
de `restaurant.category` (Pizza/Burgers/Sushi/Postres/Bebidas/Asados, usada
en los botones del Home) — confirmado que nunca se cruzan en ninguna query.

## Hallazgos reales (corregidos)

1. 🔴 **El Cliente no tenía ninguna forma de cerrar sesión ni ver su
   perfil** — no existía página de cuenta ni item en el BottomNav.
2. 🔴 **El Restaurante no tenía sección "Cuenta"** — solo un botón de
   logout suelto en la barra lateral, sin separar perfil personal de
   negocio.
3. 🟡 **Logout sin confirmación** en los 3 lugares donde existía
   (restaurante, domiciliario) — cerraba sesión al primer tap.
4. 🟡 **Logout no limpiaba datos privados locales** (carrito, última
   dirección, caché offline de IndexedDB) — relevante en dispositivos
   compartidos (ej. tablet del restaurante).
5. ✅ Back-button después de logout: ya bloqueado correctamente por
   `ProtectedRoute` (reactivo al estado de `isAuthenticated`). Sin cambios
   necesarios.

## Implementado

- `LogoutConfirmSheet` reutilizable (Bottom Sheet, no modal centrado)
- `ClientAccountPage` nueva: Mi perfil + Configuración + Cerrar sesión
- `RestaurantAccountPage` nueva: Mi perfil (personal) + Mi negocio (acceso
  directo al Dashboard, sin duplicar la edición que ya vivía ahí) +
  Configuración + Cerrar sesión
- `AuthContext.logout()` ahora limpia carrito, última dirección e
  IndexedDB
- Item "Cuenta" agregado al `BottomNav` de Cliente y Restaurante
- Confirmación de logout agregada en Restaurante y Domiciliario

## Archivos modificados

- `src/features/auth/AuthContext.tsx`
- `src/shared/components/BottomNav.tsx`
- `src/features/delivery/pages/ProfilePage.tsx`
- `src/services/offlineCache.service.ts`
- `src/config/constants.ts`
- `src/router/index.tsx`

## Archivos creados

- `src/shared/components/LogoutConfirmSheet.tsx`
- `src/features/client/pages/ClientAccountPage.tsx`
- `src/features/restaurant/pages/AccountPage.tsx`

## Base de datos

Sin migraciones. Todo lo implementado usa columnas ya existentes
(`profiles.name`, `profiles.email`).

## Seguridad

Sin cambios de RLS. Se confirmaron (no se modificaron):
`restaurants_insert_owner` (solo dueño crea), políticas de Storage de
`restaurant-covers` (solo dueño sube), `restaurants_update_owner_or_admin`
(dueño o admin editan texto).

## Tests

No hay suite de tests en el proyecto (confirmado, no inventado).

## Build

PASS (`tsc && vite build`, `injectManifest` genera `dist/sw.js`)

## Lint

PASS (`tsc --noEmit`)

## Problemas pendientes

- No se implementó cambio de rol/contexto — no existe soporte real en el
  schema (`profiles.role` es un valor único). Queda documentado como
  **FEATURE FUTURA**, no simulado.
- No se creó carpeta `/docs` completa (CURRENT_STATE/ARCHITECTURE/
  DECISIONS/CHANGELOG) — el proyecto ya tenía `RESUMEN_PROYECTO.md` en la
  raíz cumpliendo ese rol; se optó por no fragmentar la documentación en
  archivos paralelos sin pedírselo a Jorge explícitamente.

## Decisiones

- "Mi negocio" en `RestaurantAccountPage` es un acceso directo al
  Dashboard (donde ya vive la edición real: portada, abrir/cerrar) en vez
  de duplicar esa lógica en una pantalla nueva.
- Confirmación de logout implementada como Bottom Sheet (no modal
  centrado), consistente con el resto de la PWA.

## Siguiente LOOP

A definir por Jorge.
