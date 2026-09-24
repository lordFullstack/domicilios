/**
 * Grano sutil (LOOP_VISUAL_06) para superficies de marca con degradado.
 * Ruido SVG (`feTurbulence`) inline como data URI en la clase `.grain-overlay`
 * (styles.css): sin archivos ni peso extra, se rasteriza una sola vez.
 * Opacidad 0.04 y `mix-blend-mode: overlay`.
 *
 * REGLA: solo sobre fondos de marca (hero del Home; hero del restaurante sin
 * foto). NUNCA sobre una foto real. Es estático (sin animación, así que
 * prefers-reduced-motion no lo afecta), decorativo y no bloquea clicks.
 * Colocarlo dentro de un contenedor `relative` (con `overflow-hidden`).
 */
export const GrainOverlay = () => (
  <div aria-hidden="true" data-grain className="grain-overlay pointer-events-none absolute inset-0" />
)
