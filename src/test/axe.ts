import axe from 'axe-core'

/**
 * Corre axe-core sobre un fragmento renderizado y devuelve las violaciones de accesibilidad como texto
 * (vacío = sin violaciones). Se desactivan las reglas que solo tienen sentido en una página completa
 * (regiones, h1, landmarks) y el contraste, que jsdom no puede calcular: el contraste lo vigilan
 * los tests de docs/design-system (colorSystem) y Lighthouse en el navegador.
 */
export const a11yViolations = async (container: Element): Promise<string[]> => {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
      'landmark-one-main': { enabled: false },
    },
  })
  return results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`
  )
}
