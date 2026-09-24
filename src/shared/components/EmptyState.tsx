import { ReactNode } from 'react'
import { Illustration, type IllustrationName } from '@/shared/illustrations'

interface EmptyStateProps {
  /**
   * Ilustración de marca (cohete): obligatoria en todo empty state (LOOP_VISUAL_08).
   * Decorativa: el mensaje lo dan siempre el título y la descripción.
   */
  illustration: IllustrationName
  title: string
  description?: string
  action?: ReactNode
  /** 'md' (default, pantallas) o 'sm' (espacios chicos: popover de notificaciones). */
  size?: 'md' | 'sm'
}

/**
 * Estado vacío único (LOOP_VISUAL_08): ilustración del cohete + título +
 * descripción + siguiente paso opcional. `action` recibe un botón ya armado
 * por quien lo use.
 */
export const EmptyState = ({ illustration, title, description, action, size = 'md' }: EmptyStateProps) => {
  const small = size === 'sm'
  return (
    <div role="status" className={small ? 'text-center py-6 px-4' : 'text-center py-10 px-5'}>
      <Illustration name={illustration} size={small ? 'sm' : 'md'} className="mb-2" />
      <p className={small ? 'font-display font-bold text-sm text-secondary mb-1' : 'font-display font-bold text-secondary mb-1'}>
        {title}
      </p>
      {description && <p className={small ? 'text-xs text-gray-500 mb-3' : 'text-sm text-gray-500 mb-4'}>{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
