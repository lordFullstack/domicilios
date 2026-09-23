import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Icon, type IconProps } from './Icon'

/**
 * SVG como string, para lugares que no renderizan React: marcadores de
 * Leaflet (L.divIcon({ html })). Incluye el color explícito porque ahí no
 * hay currentColor heredado de un componente.
 */
export const iconToSvgString = (props: IconProps & { color?: string }): string => {
  const { color = 'currentColor', ...rest } = props
  const markup = renderToStaticMarkup(createElement(Icon, rest))
  return markup.replace('<svg ', `<svg color="${color}" `)
}
