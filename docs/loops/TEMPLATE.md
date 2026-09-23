# LOOP_<CATEGORÍA>_<NN> — <TÍTULO>

**Categoría:** CLIENT | VISUAL | ICONOS | …
**Tipo:** Feature / Fix / Consolidación / Identidad
**Estado:** 🟡 Pendiente | 🟢 Ejecutado
**Objetivo:** una frase.
**NO ES SOBRE:** qué NO cubre este LOOP y a qué LOOP pertenece.

> Plantilla derivada del formato real de LOOP_CLIENT_01…04, LOOP_ICONOS_01 y
> LOOP_VISUAL_02. Toda sección "ESTADO REAL AUDITADO" se llena con hechos
> verificados en el repo (ruta, línea, nombre real), nunca con supuestos.

---

## Naming real de los LOOPs

- LOOP_CLIENT_XX      → funcionalidad del módulo cliente
- LOOP_ICONOS_XX      → sistema de iconografía
- LOOP_VISUAL_XX      → tratamientos visuales (fotografía, mascota, etc.)
- LOOP_SECURITY_XX    → seguridad backend/frontend
- LOOP_QA_XX          → QA y cierre

---

## 0. LEE PRIMERO
Lista corta de LOOPs/archivos a leer (solo el inmediato anterior salvo necesidad).

## 1. ROL
"Actúa como: …" + qué dejaron los LOOPs anteriores.

## 2. REGLA ABSOLUTA — INSPECCIONA ANTES DE MODIFICAR
Términos a buscar en el repo + qué reportar antes de escribir código.

## 3. ESTADO REAL AUDITADO (fecha)
- 3.1 Lo que YA existe (no reconstruir): pieza pedida → qué existe hoy → acción.
- 3.2 Lo que el pedido asumía mal (corregido).
- 3.3 Lo que SÍ falta (alcance real).

## 4. NO CREAR UN SEGUNDO…
Lista de sistemas/componentes que se reutilizan y no se duplican.

## 5. PROBLEMAS A RESOLVER
Un bloque por problema, con la realidad verificada y la decisión tomada.

## 6. DECISIONES DE DISEÑO
Opciones + recomendada, y cuáles requieren confirmación de Jorge.

## 7. ALCANCE
✅ Incluido / 🚫 Fuera de alcance (con el LOOP donde va lo excluido).

## 8. COMPONENTES A CREAR / REFACTORIZAR
Árbol de archivos + qué se modifica. Mantener archivos ≤ 300 líneas.

## 9. A11Y ESPECÍFICA
## 10. PERFORMANCE
## 11. CONSOLE CLEAN
## 12. BUILD, LINT Y TYPECHECK
`npm run build` · `npm run lint` (= `tsc --noEmit`, no hay ESLint) · `npm run type-check`

## 13. TESTS
Extender tests existentes; no duplicar archivos.

## 14. QA CRÍTICO
Lista numerada de casos manuales; marcar cuáles valida el LOOP y cuáles quedan para Jorge.

## 15. CRITERIOS DE ÉXITO
Checklist `- [ ]`.

## 16. REPORTE FINAL
Se entrega en `docs/loops/<carpeta>/LOOP_<X>_<NN>_REPORTE.md`:
IMPLEMENTADO · ARCHIVOS MODIFICADOS/CREADOS/ELIMINADOS · DECISIONES · TESTS
(Build/Lint/Typecheck/Tests, antes → después) · QA · PROBLEMAS FUERA DE ALCANCE ·
DEUDA TÉCNICA · PREPARACIÓN PARA EL SIGUIENTE LOOP.

## 17. LO QUE NO DEBES HACER
## 18. REGLA FINAL
Una frase de principio + **Prioridad:** A → B → C → D → E.

## REGLA DE EJECUCIÓN
"No lo ejecutes todavía. Solo crea el archivo y confírmame ruta + tamaño."
