/**
 * Iconografía propia de Domicilios Riohacha (estilo "gota").
 * ÚNICO sistema de íconos de identidad. lucide-react queda solo para
 * íconos utilitarios (chevron, X, +, −, check…), con strokeWidth 1.75.
 */
export { Icon, ICON_SIZES, type IconProps, type IconSize, type IconVariant } from './Icon'
export { Drop } from './Drop'
export { GLYPHS, ICON_NAMES, type IconName } from './glyphs'
export { CATEGORY_ICON, CATEGORY_DROP_CLASS } from './categories'
// iconToSvgString NO se re-exporta aquí: arrastra react-dom/server. Importar
// directo desde '@/shared/icons/svgString' solo donde se necesite (Leaflet).
