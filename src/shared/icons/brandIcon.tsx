import { Icon } from './Icon'
import type { IconName } from './glyphs'

/**
 * Convierte un ícono propio en un componente con la misma forma que los de
 * lucide (`<X className="…" />`), para APIs que reciben un componente de
 * ícono, como `EmptyState icon={…}`. El tamaño lo dan las clases (w-8 h-8).
 */
export const brandIcon = (name: IconName) => {
  const BrandIcon = ({ className }: { className?: string }) => <Icon name={name} className={className} />
  BrandIcon.displayName = `BrandIcon(${name})`
  return BrandIcon
}
