# LOOP_VISUAL_09 — Reporte final

### IMPLEMENTADO
Home adaptativo (con / sin pedido activo), header compacto con `showGreeting`, saludo en `text-display`, títulos de sección con peso, "Ver todo →" solo en Restaurantes cerca de ti, sistema de ritmo `mb-8` / `mb-4` e insignia "Oferta" con más presencia.

### ARCHIVOS MODIFICADOS (11)
`ClientDashboardPage`, `HomeHeader` (+ su test), `SearchBar`, `HomeHeroBanner`, `ActiveOrderCard`, `PromoBanner`, `CategoryScroller`, `FeaturedSection`, `RestaurantsGrid` y `design-system/typographyApplication.test.ts` (el test de LOOP_VISUAL_05 exigía el saludo en `text-xl`; ahora Home usa `text-display`).

### ARCHIVOS CREADOS
`src/features/client/pages/homeStructure.test.tsx` (8 tests), `src/features/client/components/homeSections.test.tsx` (16 tests), este reporte.

### ALTURA
- Header: 198px → **116px** las dos filas (logo + dirección) / **176px** con el bloque del saludo.
- Documento (sin pedido, sin promos, carrito con 1 producto, 2 restaurantes, shell de 448px): **1012px → 1026px** (+14px). Los márgenes entre secciones suben a 32px y compensan el header más bajo.

### ORDEN DE SECCIONES
- Sin pedido: header (saludo) → búsqueda → hero → categorías → promo → 2 destacados → restaurantes. (Igual que antes.)
- Con pedido: header (`h1` sr-only "Inicio") → **pedido activo** → búsqueda → categorías → promo → 2 destacados → restaurantes. (Antes: el pedido iba después de categorías; el hero y el saludo ya no aparecen.)
- Las promos ya iban antes de los restaurantes: no cambió.

### JERARQUÍA DE TÍTULOS
- Saludo: `text-xl` → `text-display` (Sora 800, máx. 2 líneas).
- Secciones (Categorías, 2 `FeaturedSection`, Restaurantes): `text-sm gray-700` → `text-lg font-display font-bold text-secondary` (17px, Sora, verificado en navegador).
- "Ver todo →": solo Restaurantes (`aria-label` "Ver todos los restaurantes", 44px, `/app/restaurants`). `FeaturedSection` conserva su "Ver todas >". Eliminado el botón duplicado "Ver todos los restaurantes de Riohacha →" del final de la lista.
- Estructura HTML: `h1` → `h2`. Sin `h3` (los títulos de cada promo son `span` dentro de un `<button>`).

### CHEVRON Y SUBTÍTULO
- Chevron: mantenido, `aria-hidden="true"`, sin `aria-label`, `TODO(LOOP_CLIENT_06)` en el código (blindado por test).
- "Tu comida, más cerca": sin cambios (aparece 1 vez).

### RITMO
`mb-8` entre secciones mayores en: `SearchBar`, `HomeHeroBanner`, `CategoryScroller`, `ActiveOrderCard`, `PromoBanner`, `FeaturedSection` (2 variantes). `mb-4` de título a contenido. Gaps medidos en navegador: 32 / 32 / 32 px. Sin `mb-6` sueltos.

### INSIGNIA "OFERTA"
Coral y 12px (sin tocar color); `px-2 py-1` → `px-3 py-1.5` y `shadow-sm`.

### CONTRASTE DEL HERO
Cálculo sobre el gradiente real (135°, 408×141) en la zona del texto: peor caso **4.39:1** (blanco / gradiente). El texto es 18px `font-extrabold` (texto grande) → cumple AA (≥ 3:1). El pill "Explorar" (`brand-700` sobre blanco) es 14.5:1. **Sin cambios necesarios** (no se tocó overlay ni color).

### TESTS
```
Build:      OK
Lint:       OK (tsc)
Typecheck:  OK
Tests:      OK — 36 archivos / 270 (antes 34 / 241)
```
Nuevos: 4 (HomeHeader) + 8 (estructura con/sin pedido) + 16 (secciones) = 28; 1 actualizado en typographyApplication.

### QA
Validados en navegador (`/qa/home` temporal, retirada): header (116px / 176px), saludo en display, búsqueda, hero, categorías, títulos a 17px Sora, "Ver todo →" con aria-label y 44px, `h1` único, 0 `h3`, gaps de 32px, carrito flotante. Verificados por test con datos de prueba: orden con y sin pedido, `h1` sr-only, estados terminales, promos antes de restaurantes.

**Pendientes de Jorge (con sesión):** Home con pedido activo real, `PromoBanner` y `FeaturedSection` con datos, insignia "Oferta", Lighthouse Accessibility.

### PROBLEMAS ENCONTRADOS
- El panel del navegador cambió de ancho durante la QA; se midió con el shell a 448px. A ~300px de ancho, "Restaurantes cerca de ti" pasa a 2 líneas junto a "Ver todo →" (funciona, no rompe).

### DEUDA TÉCNICA GENERADA
- **LOOP_CLIENT_06:** selector de dirección (el chevron es decorativo).
- **LOOP_QA_TOOLING:** Axe (sustituto: Lighthouse, lo corre Jorge).
- **LOOP_VISUAL_10:** `PromoBanner` con fondo `style` inline.
- `PromoBanner` sigue con `h-28`; no se agrandó (fuera de lo pedido en las sub-tandas).

### CIERRE
- **Hash del commit:** `e3465e6` (`e3465e6cf269c95e39adba45e442f6bf6475c655`)
- **Hash del merge:** `e3465e6` (fast-forward a `main`, sin commit de merge)
- **QA a 360px:** "Restaurantes cerca de ti" + "Ver todo →" caben en una línea (título 209px, botón 77×44, 33px libres); sin cambios.
- **Estado de la rama `loop/visual-09-home`:** pendiente de borrar tras verificar producción (READY + revisión de Jorge). No borrada.

### PREPARACIÓN PARA LOOP_VISUAL_07
El saludo, los títulos de sección y el bloque del pedido activo tienen ya su jerarquía y espaciado estables para animar entradas.
