# 🗄️ BASE DE DATOS EN NAVEGADOR

## Descripción

Loop Maestro MVP usa **localStorage** e **IndexedDB** como base de datos. Esto permite:

- ✅ Desarrollo sin dependencia de backend
- ✅ Datos persistentes en el navegador
- ✅ Migracion a Supabase cuando sea necesario
- ✅ Trabajo completamente offline
- ✅ Testing rápido

---

## 📊 Estructura de Datos

### LocalStorage (datos pequeños)

```typescript
STORAGE_KEYS = {
  // Auth
  AUTH_USER: 'auth_user',
  AUTH_SESSION: 'auth_session',
  
  // Datos principales
  USERS: 'users',
  RESTAURANTS: 'restaurants',
  PRODUCTS: 'products',
  
  // Usuario
  CURRENT_USER: 'current_user',
  CART: 'cart',
  RESTAURANT_FAVORITES: 'restaurant_favorites',
  
  // Preferencias
  USER_PREFERENCES: 'user_preferences',
}
```

### IndexedDB (datos grandes)

```typescript
// Stores
'orders'        // Órdenes
'orderItems'    // Items de órdenes
```

---

## 🔐 CUENTAS DE PRUEBA

Para login, usa cualquiera de estas credenciales:

### Cliente
```
Email: cliente@test.com
Password: password123
Rol: client
```

### Restaurante
```
Email: restaurante@test.com
Password: password123
Rol: restaurant
```

### Domiciliario
```
Email: delivery@test.com
Password: password123
Rol: delivery
```

### Admin
```
Email: admin@test.com
Password: password123
Rol: admin
```

**Nota:** Las contraseñas NO se validan en modo mock (solo para testing).

---

## 🎯 DATOS DE PRUEBA INCLUIDOS

### Usuarios (5)
- 2 Clientes
- 1 Restaurante (dueño)
- 1 Domiciliario
- 1 Admin

### Restaurantes (3)
- 🍕 Pizza Italia
- 🍔 Burger House
- 🍣 Sushi Tokyo

### Productos (12)
- 4 Pizzas (Pizza Italia)
- 4 Burgers (Burger House)
- 4 Sushi (Sushi Tokyo)

### Órdenes de Ejemplo (2)
- 1 Entregada
- 1 Confirmada

---

## 🛠️ USO EN CÓDIGO

### Servicios de Storage

```typescript
import { localStorageService, STORAGE_KEYS } from '@/services/storage.service'

// Guardar
localStorageService.set(STORAGE_KEYS.RESTAURANTS, data)

// Obtener
const restaurants = localStorageService.get(STORAGE_KEYS.RESTAURANTS)

// Eliminar
localStorageService.remove(STORAGE_KEYS.RESTAURANTS)

// Verificar existencia
if (localStorageService.has(STORAGE_KEYS.RESTAURANTS)) {
  // ...
}
```

### Hooks para Componentes

```typescript
import { useRestaurants, useProducts, useCart, useOrders } from '@/hooks/useLocalData'

// En componente
export const MyComponent = () => {
  const { restaurants, loading } = useRestaurants()
  const { products } = useProducts(restaurantId)
  const { cart, addItem, removeItem } = useCart()
  const { orders, createOrder } = useOrders(userId)
}
```

---

## 🔄 INICIALIZACIÓN

Al abrir la app por primera vez:

1. ✅ Se detecta que no hay datos
2. ✅ Se cargan datos mock desde `mockData.ts`
3. ✅ Se guardan en localStorage
4. ✅ App lista para usar

```typescript
// En AuthProvider
const isInitialized = localStorageService.get('app_initialized')
if (!isInitialized) {
  initializeMockData()
  localStorageService.set('app_initialized', true)
}
```

---

## 🔄 SINCRONIZACIÓN

### Local → Supabase (Futura)

Cuando migres a Supabase, solo necesitarás:

1. Reemplazar `mockSupabase.ts` con cliente real de Supabase
2. Cambiar imports de `mockSupabase` a `supabase`
3. Listo - el resto del código sigue funcionando

```typescript
// Cambiar
import { mockSupabase } from '@/services/mockSupabase'

// Por
import { supabase } from '@supabase/supabase-js'
```

---

## 🎮 TESTING

### Ver datos en DevTools

1. Abre Chrome DevTools (F12)
2. Ir a **Application** → **Local Storage**
3. Haz clic en la URL de la app
4. ¡Verás todos los datos!

### Limpiar datos

```typescript
// En consola del navegador
localStorage.clear()
indexedDB.deleteDatabase('loop-maestro-mvp')
location.reload()
```

---

## 📈 LÍMITES

| Almacenamiento | Límite | Uso |
|---|---|---|
| **localStorage** | 5-10 MB | Datos pequeños |
| **IndexedDB** | 50 MB+ | Datos grandes |
| **Sesión Auth** | ilimitado | JWT en memoria |

---

## ⚠️ IMPORTANTE

### En Producción
- ❌ NO uses localStorage para datos sensibles (contraseñas)
- ❌ NO guardes tokens en localStorage (hay vulnerabilidades XSS)
- ✅ Usa httpOnly Cookies para tokens
- ✅ Migra a Supabase cuando escales

### En Desarrollo
- ✅ Usa localStorage/IndexedDB
- ✅ Prueba todas las features localmente
- ✅ Valida sincronización cuando agregues backend

---

## 🚀 MIGRACIÓN A SUPABASE

Cuando estés listo para backend real:

### 1. Configurar Supabase
```bash
# En .env
VITE_SUPABASE_URL=tu-url
VITE_SUPABASE_ANON_KEY=tu-key
```

### 2. Reemplazar mockSupabase
```typescript
// Cambiar en AuthContext y otros archivos
- import { mockSupabase } from '@/services/mockSupabase'
+ import { supabase } from '@/shared/utils/supabase'
```

### 3. Sincronizar datos
```typescript
// Script para copiar datos
const syncToSupabase = async () => {
  const restaurants = localStorageService.get(STORAGE_KEYS.RESTAURANTS)
  // Guardar en Supabase
  await supabase.from('restaurants').insert(restaurants)
}
```

### 4. Listo
- La app sigue funcionando igual
- Pero ahora usa backend real

---

## 🆘 TROUBLESHOOTING

### "Datos desaparecieron"
**Causa:** Se limpió localStorage accidentalmente
**Solución:** Recargar la página - se reinicializa con datos mock

### "Cambios no se guardan"
**Causa:** Código no llama a `localStorageService.set()`
**Solución:** Revisar que use el servicio correcto

### "Mucha lentitud con muchos datos"
**Causa:** localStorage es síncrono
**Solución:** Usar IndexedDB para datos grandes

---

## 📚 REFERENCIA RÁPIDA

```typescript
// Obtener datos
const users = localStorageService.get(STORAGE_KEYS.USERS)

// Agregar
const newUsers = [...users, newUser]
localStorageService.set(STORAGE_KEYS.USERS, newUsers)

// Actualizar
const updated = users.map(u => u.id === id ? { ...u, ...changes } : u)
localStorageService.set(STORAGE_KEYS.USERS, updated)

// Eliminar
const filtered = users.filter(u => u.id !== id)
localStorageService.set(STORAGE_KEYS.USERS, filtered)
```

---

## ✅ CHECKLIST

- ✅ Datos mock cargados
- ✅ Accounts de prueba funcionando
- ✅ localStorage guarda cambios
- ✅ IndexedDB para órdenes
- ✅ Componentes usan hooks correctos
- ✅ Sincronización lista para Supabase

¡Adelante! 🚀
