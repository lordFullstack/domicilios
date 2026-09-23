# LOOP_VISUAL_04 — Color Disciplinado (un sistema, no una paleta)

**Categoría:** VISUAL
**Tipo:** Sistema visual / Consolidación
**Estado:** 🟢 Aprobado — listo para ejecutar
**Objetivo:** Reducir la paleta en uso de ~8 colores sueltos a un sistema semántico estricto de 4 roles + marca, eliminar el coral suelto (sobrevive solo en la insignia "Oferta"), eliminar el azul legacy del manifest, y documentar cuándo se usa cada color. **La migración de los aliases `primary`/`secondary`/`primary-dark` NO entra aquí: va a LOOP_VISUAL_04B.**
**NO ES SOBRE:** iconografía (LOOP_ICONOS_01), fotografías (LOOP_VISUAL_02), ilustraciones (LOOP_VISUAL_03), tipografía (LOOP_VISUAL_05), migración de aliases (LOOP_VISUAL_04B).

> **AJUSTES CONFIRMADOS POR JORGE (23-sep-2026)** — mandan sobre cualquier otra
> sección: (1) alcance dividido, aliases → 04B; (2) coral eliminado salvo la
> insignia "Oferta"; (3) sin tokens `-soft`, se usan opacidades; (4) criterio
> de CTA por pantalla; (5) `theme_color` del manifest autorizado.

---

## 0. LEE PRIMERO

1. `docs/loops/TEMPLATE.md` (plantilla maestra)
2. `docs/loops/visual/LOOP_VISUAL_03.md` (LOOP inmediatamente anterior — ya ejecutado)

No leas LOOPs más antiguos salvo que este LOOP lo requiera explícitamente.

---

## 1. ROL

Actúa como:

**Senior Product Designer + Design System Engineer + Frontend Engineer + Accessibility Specialist**

Continúa trabajando sobre el repositorio existente de Domicilios Riohacha.

Los LOOPs anteriores construyeron:
- Iconografía propia (Lucide + custom)
- Tratamiento fotográfico premium
- 6 ilustraciones de marca + NotFound + EmptyState con prop illustration

---

## 2. REGLA ABSOLUTA

ANTES DE MODIFICAR: INSPECCIONA.

Busca en el repositorio TODOS los colores hardcodeados y clases de color en uso:

```text
#2F5EFF       (azul legacy)
#2E3A8C       (azul del cohete)
#1C2459       (brand-700)
#FF5A6B       (coral legacy)
#F4652C       (naranja atardecer)
#FFC24B       (dorado atardecer)
#F59E0B       (accent/warning)
#10B981       (success)
#EF4444       (danger)
#0EA5E9       (info)
```

Busca también por clases Tailwind:

```text
text-brand-*
bg-brand-*
text-coral
bg-coral
text-accent
bg-accent
text-success
text-danger
text-warning
text-info
text-primary
bg-primary
```

Revisa al menos:

```text
src/styles.css
tailwind.config.ts
src/shared/components/
src/features/client/
src/features/auth/
```

Reporta ANTES de tocar:
- Lista completa de colores hardcodeados encontrados (con archivo y línea)
- Lista completa de clases de color Tailwind en uso (con frecuencia aproximada)
- Dónde se usa coral como texto
- Dónde se usa coral como fondo o borde
- Dónde se usa el azul legacy (#2F5EFF)
- Dónde se usa el azul del cohete (#2E3A8C) vs brand-700 (#1C2459)
- Dónde hay azul plano en botones (ej. el botón "Iniciar sesión" del 404)
- Si hay otros colores fuera de paleta (ej. morados, verdes raros, rosas)
- Cuántos colores únicos están en uso hoy

NO inventes. Si algo no aparece, dilo.

Si algo no existe, lo creas. Si existe, lo reutilizas.

---

## 3. NO CREAR UN SEGUNDO DE LO QUE YA EXISTE

Si ya existe:

```text
--brand
--brand-soft
--brand-gradient
brand-50 a brand-900
ink.DEFAULT, ink.muted
surface.DEFAULT, surface.soft
accent, success, warning, danger, info
coral (legacy)
primary (legacy)
```

REUTILIZAR. No crear nuevas variables CSS ni nuevos colores en Tailwind.

El objetivo del LOOP es REDUCIR, no agregar.

Si existe un token que no se usa, NO eliminarlo sin verificar que nadie lo consume.
Si existe un token que se usa poco, evaluarlo antes de eliminarlo.

---

## 4. CONTEXTO ACTUAL

Según capturas y LOOPs previos:
- El botón "Iniciar sesión" del 404 usa `bg-primary` (#2E3A8C, el azul del cohete), no el legacy (verificado 23-sep-2026)
- El botón "Explorar" del hero usa azul plano también
- Los precios en carrito, orders y restaurant detail usan coral (#FF5A6B)
- Los botones `+` de producto usan coral
- El cohete del 404 usa gradiente atardecer (correcto)
- Los estados (Pendiente amarillo, Cancelada rojo) usan colores correctos
- Probablemente hay más azul plano suelto por toda la app

El problema: hay al menos 3 "azules" compitiendo:
1. Azul legacy (#2F5EFF)
2. Azul del cohete (#2E3A8C)
3. Brand-700 (#1C2459)

Y el coral legacy (#FF5A6B) está usado como color de texto principal en varios lugares.

---

## 5. PROBLEMAS A RESOLVER

### PROBLEMA 1 — Azul legacy y azules competidores
Auditado el 23-sep-2026: el azul legacy **#2F5EFF ya no lo usa ningún componente**; solo queda en (a) `theme_color` de `vite.config.ts` (manifest de la PWA) y (b) un comentario en `styles.css`. Este LOOP:
- Cambia `theme_color` de `#2F5EFF` a **`#1C2459`** en `vite.config.ts`. **Es el ÚNICO cambio autorizado al manifest**: no tocar icons, name, start_url ni nada más.
- Reescribe el comentario de `styles.css` para que no mencione el azul legacy como vigente.
- Documenta cuál azul se usa en cada rol (marca, hover, fondo sutil). Los aliases `primary`/`primary-dark` (que apuntan a #2E3A8C/#242E70) **no se migran aquí** (→ 04B).

### PROBLEMA 2 — Coral suelto (OPCIÓN A REFORZADA)
`#FF5A6B` tiene contraste ~3:1 sobre blanco → falla WCAG AA. Se elimina de todos los usos EXCEPTO la insignia "Oferta" de `FeaturedSection`, que sobrevive como badge semántico. Migraciones:

| Uso actual | Archivo(s) | Destino |
|---|---|---|
| Precios y totales (texto) | `CartPage`, `FeaturedProductStrip`, `MenuProductCard`, `OrderCard`, `OrderSummaryCard`, `CheckoutPage` | `text-ink` (#1C1917) `font-semibold` |
| Total destacado en checkout | `CheckoutPage` | `text-brand-700` `font-bold` |
| Botón "+" de producto | `MenuProductCard`, `FeaturedProductStrip` | `bg-brand-700` |
| Botón "+" del stepper | `CartPage` | `bg-brand-700` |
| Insignia "Oferta" | `FeaturedSection` | **mantiene coral** (único uso permitido) |
| Punto/badge de notificaciones | `NotificationBell`, `NotificationsPage` | `bg-danger` (#EF4444) |
| Fondos de notificaciones no leídas | `NotificationBell`, `NotificationsPage` | `bg-danger/10` (y borde `border-danger/10`) |
| Contador de notificaciones | `ClientAccountPage` | `bg-danger` |
| Texto/fondo de `Badge` (variante coral) | `Badge.tsx` | verificar quién la usa; migrar a `danger` o a la variante semántica que corresponda |

El token `coral` **se conserva** en `tailwind.config.ts` (lo consume la insignia "Oferta"); ningún otro archivo debe usarlo. Registrar en el reporte el conteo antes/después.

### PROBLEMA 3 — Botones con azul plano y sin criterio de jerarquía
Aplicar el criterio de la sección 12 (1 CTA principal por pantalla → `brand-gradient`; varios del mismo peso → `brand-700` sólido; terciario → `surface` con borde `brand-700`; destructivo → `surface` con borde `danger` o `bg-danger`). Incluye "Iniciar sesión" del 404 y el botón "Explorar" del hero.

### PROBLEMA 4 — Sin sistema semántico
Los colores se usan por apariencia, no por función. Sistema:
- **Marca:** brand-700, brand-gradient (CTAs, hero, logo)
- **Éxito:** success (#10B981) — pedido entregado, dirección guardada
- **Alerta:** warning (#F59E0B) — pedido pendiente, límite cercano
- **Error:** danger (#EF4444) — pedido cancelado, error de pago, notificación sin leer
- **Info:** info (#0EA5E9) — tips, hints (usar MUY poco; hoy hay 1 uso)
- **Acento:** accent (#F59E0B) — con mesura, no como decoración (nota: `accent` y `warning` son el mismo valor)
- **Neutro:** ink, surface, gray-* — el 90% de la UI

### PROBLEMA 5 — Sin documentación
No hay guía de cuándo usar cada color. Se documenta en `docs/design-system/COLORS.md`.

### PROBLEMA 6 — Colores fuera de paleta
Hexadecimales sueltos detectados en la auditoría rápida (fuera de `tailwind.config.ts`/`styles.css`): `#FFE3D1` (`icon-tint`, ya tokenizado), y los hex propios de las ilustraciones (`PALETTE` en `shared/illustrations/types.ts`, ya documentados y cerrados). Si la auditoría completa encuentra morados, rosas o verdes fuera de sistema (p. ej. los tintes por categoría en `colors.category.*`, que son decisión de identidad del Home), reportarlos antes de eliminarlos.

### PROBLEMA 7 — Sin escalas coherentes
`brand` tiene 50–900, pero `ink`/`surface` tienen pocos niveles. Documentar la equivalencia `ink.muted` = `gray-500` (#78716C) sin crear tokens nuevos.

### PROBLEMA 8 — Coral en tailwind.config
`coral: '#FF5A6B'` **se conserva** solo para la insignia "Oferta" (ver Problema 2). Si tras la migración ese es el único consumidor, dejarlo comentado como tal.

### PROBLEMA 9 — Aliases legacy → LOOP_VISUAL_04B
`primary`, `primary-dark`, `secondary` e `ink-muted` **NO se tocan en este LOOP**. Auditado el 23-sep-2026: `text-primary` ~79 usos, `bg-primary` ~59, `border-primary` ~22, `ring-primary` ~15, `primary-dark` ~11, `text-secondary` ~205, `bg-secondary` ~11, `ink-muted` 2. Migrar ~400 ocurrencias en toda la app (incluyendo admin/restaurante/domiciliario) es un LOOP propio: **LOOP_VISUAL_04B**, con su alcance y su decisión de color destino (`primary` hoy es #2E3A8C, no #1C2459).

### PROBLEMA 10 — Sin guía de contraste
Documentar en `COLORS.md` el contraste de cada par usado. Punto crítico: `success` (#10B981) y `warning` (#F59E0B) **no pasan AA como texto** sobre blanco (2.5:1 y 2.15:1, por eso existen `success-strong` y `warning-strong`). Los estados "soft" (`bg-success/10`, `bg-warning/10`) deben llevar texto `text-success-strong` / `text-warning-strong`, no `text-success`/`text-warning`. `danger` (#EF4444, ~3.8:1) e `info` (#0EA5E9) **no tienen variante `-strong`** y **NO se crea `danger-strong`** (decisión confirmada por Jorge). `danger` se rige por las reglas de la Decisión 3 y de la sección 11.

---

## 6. DECISIONES DE DISEÑO

### Decisión 1 — Un solo azul de marca
- Azul principal: **brand-700 (#1C2459)** para texto, foco, links
- Azul soft: **brand-500 (#2E3A8C)** para hover, estados activos
- Azul background sutil: **brand-50 (#EEF0FA)** para chips inactivos, fondos
- Gradiente: **brand-gradient (atardecer)** para el CTA principal de cada pantalla y hero
- **El azul legacy (#2F5EFF) desaparece del código y del manifest** (`theme_color` → #1C2459)
- Los aliases `primary`/`primary-dark` NO se migran aquí (→ 04B)

### Decisión 2 — Coral: Opción A reforzada (CONFIRMADA)
El coral se elimina de todo el sistema **excepto la insignia "Oferta" de `FeaturedSection`**, que sobrevive como badge semántico. Precios y totales → `ink`; total destacado de checkout → `brand-700`; botones "+" → `brand-700`; puntos y fondos de notificaciones → `danger` / `danger/10`; contador de cuenta → `danger`. Ver tabla completa en la sección 5.

### Decisión 3 — Sistema semántico de 4 roles, sin tokens `-soft` (ACTUALIZADA)
- **success (#10B981):** confirmación, completado, disponible
- **warning (#F59E0B):** pendiente, precaución, límite cercano
- **danger (#EF4444):** error, cancelado, eliminación, no leído
- **info (#0EA5E9):** información neutral (usar muy poco)

#### Reglas de uso de `danger` (CONFIRMADAS; NO se crea `danger-strong`)
**Permitido:**
- Fondo `danger` + texto blanco (botones destructivos)
- Íconos `danger` (acompañan texto en `ink`)
- Badges y puntos (con contexto visual)
- Bordes y rings de error en inputs
- Texto grande (≥ 18px) o bold ≥ 14px

**Prohibido:**
- Texto pequeño (< 14px) en `danger` sin ícono acompañante

**NO se crean variantes `-soft`.** El fondo suave se obtiene con opacidades de Tailwind sobre el token existente:

| Rol | Fondo suave | Texto |
|---|---|---|
| success | `bg-success/10` | `text-success-strong` (el `success` plano no pasa AA como texto) |
| warning | `bg-warning/10` | `text-warning-strong` (idem) |
| danger | `bg-danger/10` | `text-danger` solo bajo las reglas de uso de abajo |
| info | `bg-info/10` | `text-info` (sin variante `-strong`: ver Problema 10) |

### Decisión 4 — Escala neutra
- **ink:** texto principal (#1C1917)
- **ink-muted:** texto secundario (#78716C) = `gray-500` (documentar la equivalencia; el alias `ink-muted` se migra en 04B)
- **gray-*:** 50-900 (ya existe, mantener)
- **surface:** fondos (#FFFFFF, #FAFAF9, #F5F5F4)

### Decisión 5 — Documentación
Crear `docs/design-system/COLORS.md` con:
- Lista de tokens y su uso
- Ejemplos de cada uno
- Cuándo usar cada uno
- Cuándo NO usar cada uno
- Contraste mínimo requerido (con los pares reales medidos)

---

## 7. ALCANCE (REDUCIDO)

### ✅ Incluido en LOOP_VISUAL_04
- Auditoría completa de colores en uso
- Cambio de `theme_color` en `vite.config.ts` de `#2F5EFF` a `#1C2459` (**único cambio autorizado al manifest**: no tocar icons, name, start_url ni nada más)
- Limpieza del comentario de `styles.css` que aún cita el azul legacy
- Migración del coral como texto a `ink` / `brand-700` (tabla de la sección 5)
- Coral como fondo/borde: botones "+" → `brand-700`; notificaciones → `danger`; contador de cuenta → `danger`
- Insignia "Oferta" de `FeaturedSection`: **conserva coral** (único uso permitido)
- Botones CTA: aplicar el criterio de la sección 12
- Estados semánticos success/warning/danger/info con fondos `/10` (sin tokens nuevos)
- Documentación en `docs/design-system/COLORS.md`
- Verificación de contraste WCAG AA de los pares texto-fondo tocados

### 🚫 Fuera de alcance → LOOP_VISUAL_04B
- Migración de los aliases `primary`, `primary-dark`, `secondary`, `ink-muted` (~400 ocurrencias) y su eliminación de `tailwind.config.ts`
- Decisión del color destino de `primary` (#2E3A8C actual vs `brand-700` #1C2459)

### 🚫 Fuera de alcance (otros LOOPs)
- Iconografía (LOOP_ICONOS_01)
- Fotografías (LOOP_VISUAL_02)
- Ilustraciones (LOOP_VISUAL_03)
- Tipografía (LOOP_VISUAL_05)
- Motion (LOOP_VISUAL_07)
- Nuevas features

---

## 8. COMPONENTES A REFACTORIZAR

No se crean componentes nuevos. Se refactorizan los existentes que usen colores fuera de sistema:

Identificar y refactorizar:
- Botones CTA (cualquier pantalla)
- Precios (carrito, orders, restaurant detail, cards)
- Botones `+` de producto
- Chips de filtro
- Badges (notificación, oferta, estado)
- Estados de pedido (timeline, cards)
- Alertas, errores, banners
- Cualquier elemento con coral
- Cualquier elemento con azul legacy

---

## 9. MOCKUP ASCII

Antes (botón suelto):

```text
┌──────────────────────┐
│  Iniciar sesión      │  ← azul plano (#2F5EFF o #2E3A8C)
└──────────────────────┘
```

Después (botón CTA principal):

```text
┌──────────────────────┐
│  Iniciar sesión      │  ← brand-gradient (atardecer)
└──────────────────────┘
```

Antes (precio suelto):

```text
Total     $41.000  ← coral #FF5A6B (falla AA)
```

Después (precio correcto):

```text
Total     $41.000  ← ink #1C1917 semibold
```

---

## 10. REGLAS ARQUITECTÓNICAS

- NO crear nuevos colores en tailwind.config
- NO crear nuevas variables CSS
- NO tocar los aliases legacy `primary`/`secondary`/`primary-dark`/`ink-muted` (→ LOOP_VISUAL_04B)
- SÍ consolidar en tokens existentes
- Un solo origen de verdad: styles.css + tailwind.config.ts
- El gradiente `brand-gradient` es el CTA principal
- El coral desaparece de todo uso salvo la insignia "Oferta" de `FeaturedSection`
- El azul legacy (#2F5EFF) desaparece (incluido `theme_color` del manifest, único cambio autorizado allí)
- Los estados semánticos usan success/warning/danger con fondos `/10` (sin tokens `-soft`)
- `info` se usa muy poco
- Si un token no se puede eliminar sin romper algo, reportar y proponer plan

---

## 11. A11Y ESPECÍFICA

- Todo texto debe cumplir WCAG AA (contraste ≥ 4.5:1 normal, ≥ 3:1 para texto grande)
- Los botones con texto blanco sobre brand-gradient deben tener contraste suficiente
- Los estados de color (Pendiente, Cancelada) deben tener ICONO además de color (no depender solo del color)
- Los focos visibles usan brand-700
- Documentar contraste en COLORS.md
- Verificar con Chrome DevTools y Axe

### `danger` sin variante `-strong`
- Regla completa en la sección 6 (Decisión 3); se documenta también en `COLORS.md`.
- Permitido: fondo `danger` + texto blanco, íconos (con texto en `ink`), badges y puntos, bordes/rings de error, texto ≥ 18px o bold ≥ 14px.
- Prohibido: texto < 14px en `danger` sin ícono acompañante.
- Test/auditoría: buscar `text-danger` y revisar que cada uso cumpla la regla.

---

## 12. UX ESPECÍFICA

### Criterio de jerarquía de CTAs (CONFIRMADO)
- **1 CTA principal por pantalla** → `brand-gradient`
- **Varios CTAs del mismo peso** → todos `brand-700` sólido (no hay uno solo con degradado)
- **CTA terciario** → `surface` con borde `brand-700`
- **CTA destructivo** → `surface` con borde `danger`, o `bg-danger` si es la acción principal de un diálogo de confirmación

Ejemplos: 404 → "Iniciar sesión"/"Volver al inicio" es el único CTA → `brand-gradient`. Checkout → "Confirmar pedido" → `brand-gradient`. Diálogo de vaciar carrito → "Vaciar" `bg-danger`, "Cancelar" terciario.

### Resto
- Los precios van en `ink` semibold
- Los totales van en `brand-700` bold (total destacado del checkout)
- Los estados semánticos van con fondo `/10` + texto del color (variante `-strong` donde exista) + ícono
- La insignia "Oferta" es el único elemento que conserva coral
- Botones "+" de producto en `brand-700`
- Punto/badge de notificación sin leer en `danger`

---

## 13. PERFORMANCE

- No aplica directamente. Los cambios son de tokens y clases.

---

## 14. TESTS

### Unit
- Verificar que no queda `#2F5EFF` en ningún archivo de src/
- Verificar que no queda `#2F5EFF` en `vite.config.ts` (`theme_color` = `#1C2459`)
- Verificar que `coral` solo se consume en `FeaturedSection.tsx` (insignia "Oferta")
- Verificar que no queda `text-coral` ni `bg-coral/…` fuera de esa insignia
- Los aliases `primary`/`secondary` siguen en `tailwind.config` (los migra 04B): NO deben eliminarse aquí

### Visual
- Snapshot de Home, Restaurantes, Detalle, Carrito, Orders, Perfil, 404

### A11y
- Axe en cada pantalla principal → 0 violaciones de contraste

---

## 15. CRITERIOS DE ÉXITO

- [ ] Auditoría completa de colores en uso documentada
- [ ] Azul legacy (#2F5EFF) eliminado (código y `theme_color` del manifest = #1C2459; nada más del manifest cambia)
- [ ] Coral solo en la insignia "Oferta" de `FeaturedSection`
- [ ] Aliases legacy intactos (migración → LOOP_VISUAL_04B)
- [ ] styles.css con comentarios/tokens limpios
- [ ] docs/design-system/COLORS.md creado
- [ ] CTAs según el criterio de la sección 12 (1 principal → brand-gradient; varios iguales → brand-700)
- [ ] Todos los precios en ink semibold
- [ ] Total destacado del checkout en brand-700 bold
- [ ] Estados semánticos con fondos `/10` (sin tokens `-soft`)
- [ ] Botón "Iniciar sesión" del 404 usa brand-gradient
- [ ] Axe: 0 violaciones de contraste
- [ ] Lighthouse a11y ≥ 95
- [ ] Consola limpia
- [ ] Build exitoso
- [ ] Lint exitoso
- [ ] Sin regresiones visuales en pantallas ya entregadas

---

## 16. QA CRÍTICO

1. Home sin azul legacy visible
2. Restaurantes sin azul legacy visible
3. Detalle sin coral como texto
4. Carrito con precios en ink
5. Carrito sin coral en totales
6. Orders sin coral en precios
7. Perfil sin colores fuera de paleta
8. 404 con botón "Iniciar sesión" en brand-gradient
9. Chip "Todos" del filtro con brand-700
10. Estados de pedido con icono + color (no solo color)
11. Insignia "Oferta" conserva coral (único uso)
12. Notificaciones sin leer (punto, fondo y contador de cuenta) con danger
13. Botones `+` de producto en brand-700 (sin coral)
14. Botón "Explorar" del hero sin azul plano
15. Alertas con fondos soft correctos
16. Axe: 0 violaciones de contraste en Home
17. Axe: 0 violaciones de contraste en Carrito
18. Axe: 0 violaciones de contraste en Orders
19. Consola limpia
20. Build exitoso

---

## 17. REGLAS IMPORTANTES

- NO crear colores nuevos
- NO introducir dependencias
- NO tocar iconografía, fotografías ni ilustraciones
- NO tocar tipografía
- NO tocar motion
- NO cambiar estructura de componentes
- NO romper funcionalidad
- El coral DEBE desaparecer salvo en la insignia "Oferta"
- El azul legacy (#2F5EFF) DEBE desaparecer (código + `theme_color`)
- NO migrar aliases `primary`/`secondary` (→ 04B)
- En `vite.config.ts` solo se cambia `theme_color`: NO tocar icons, name, start_url ni el resto del manifest
- Si algo no tiene claro qué token usar, preguntar antes de inventar

---

## 18. REPORTE FINAL

### IMPLEMENTADO
<resumen>

### ARCHIVOS MODIFICADOS
<lista>

### ARCHIVOS CREADOS
<lista> (incluye `docs/design-system/COLORS.md`)

### AUDITORÍA DE COLORES
- Colores únicos encontrados: N
- Colores eliminados: N
- Colores migrados: N
- Colores que se mantienen: N

### TOKENS
- Antes: <lista>
- Después: <lista> (aliases `primary`/`secondary`/`primary-dark`/`ink-muted` intactos → 04B)

### CORAL
- Ubicaciones encontradas (texto): <lista archivo:línea>
- Ubicaciones encontradas (fondo/borde): <lista archivo:línea>
- Decisión: **Opción A reforzada** — eliminado salvo la insignia "Oferta" de `FeaturedSection`
- Migrado a: precios/totales → `ink` semibold; total destacado de checkout → `brand-700` bold; botones "+" → `brand-700`; notificaciones y contador de cuenta → `danger` / `danger/10`
- Conteo de usos de coral: antes N → después 1 (la insignia)

### AZUL LEGACY
- Ubicaciones encontradas: <lista> (`vite.config.ts` `theme_color`, comentario de `styles.css`)
- Migrado a: `theme_color` → `#1C2459` (único cambio al manifest)

### BOTONES CTA
- Cuántos migrados a brand-gradient (1 principal por pantalla)
- Cuántos migrados a brand-700 (varios del mismo peso)
- Cuántos quedaron en surface con borde (terciarios)
- Cuántos destructivos (surface + borde danger / bg-danger)

### DANGER — REGLAS DE USO
Conteo de cada uso de `danger` tras la migración:
- Fondo (`bg-danger`, texto blanco): N
- Ícono: N
- Texto grande (≥ 18px o bold ≥ 14px): N
- Texto pequeño sin ícono (debe ser 0): N
- Borde / ring de error: N
- Badges y puntos: N
- Violaciones corregidas: N

### ESTADOS SEMÁNTICOS
- Success usado en: <lista>
- Warning usado en: <lista>
- Danger usado en: <lista> (incluye notificaciones sin leer)
- Info usado en: <lista>
- Fondos suaves: `bg-{rol}/10` (sin tokens `-soft`)

### DOCUMENTACIÓN
- COLORS.md creado en: `docs/design-system/COLORS.md`

### A11Y
- Pares texto-fondo verificados: N
- Violaciones encontradas: N
- Violaciones corregidas: N
- `danger` sin variante `-strong`: reglas de uso confirmadas (ver DANGER — REGLAS DE USO)

### TESTS
```
Build:      OK / FAIL
Lint:       OK / FAIL / N/A
Typecheck:  OK / FAIL / N/A
Tests:      OK / FAIL / N/A
```

### QA
<cuáles de 20 validados>

### PROBLEMAS ENCONTRADOS
<fuera de alcance>

### DEUDA TÉCNICA GENERADA
- Migración de aliases `primary`/`secondary`/`primary-dark`/`ink-muted` (~400 usos) → LOOP_VISUAL_04B
- <otra deuda>

### PREPARACIÓN PARA LOOP_VISUAL_04B / 05
<qué quedó preparado: conteo exacto de aliases por archivo para 04B>

---

## 19. LO QUE NO DEBES HACER

- NO agregar colores nuevos
- NO crear tokens paralelos
- NO tocar iconos, fotos ni ilustraciones
- NO tocar tipografía
- NO tocar motion
- NO tocar estructura de componentes
- NO introducir dependencias
- NO romper funcionalidad existente
- NO dejar azul legacy en el código ni en el manifest
- NO dejar coral en ningún lugar salvo la insignia "Oferta"
- NO migrar aliases `primary`/`secondary` (→ LOOP_VISUAL_04B)
- NO crear tokens `-soft` ni variantes `-strong` nuevas sin aprobación

---

## 20. REGLA FINAL

El color es el 40% de la percepción de marca. Si hay 8 colores sueltos compitiendo, la marca se ve débil. Si hay 4 colores semánticos + marca, la app se ve profesional.

Cada color debe ganarse su lugar. Si un color no comunica algo (estado, marca, jerarquía), no debe existir.

**Prioridad:** DISCIPLINA → ACCESIBILIDAD → CONSISTENCIA → CLARIDAD → ESTÉTICA

Si tienes que elegir entre un color "bonito" y un color que cumpla su función semántica: elige el que cumple su función.

El coral solo sobrevive en la insignia "Oferta". El azul legacy no sobrevive. Los aliases legacy se atienden en LOOP_VISUAL_04B. Lo que sobrevive es el sistema.

---

## REGLA DE EJECUCIÓN

No lo ejecutes todavía.

Solo crea el archivo en `docs/loops/visual/LOOP_VISUAL_04.md` y confírmame:
- Ruta exacta
- Tamaño (líneas + KB)
- Cualquier decisión que necesites que yo confirme antes de ejecutar
