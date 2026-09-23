import { ElementType, ReactNode } from 'react'
import { Illustration, type IllustrationName } from '@/shared/illustrations'

interface EmptyStateProps {
  /** Ícono de lucide o de la iconografía propia (`brandIcon('restaurants')`). */
  icon?: ElementType
  /**
   * Ilustración de marca (cohete). Si se pasa, reemplaza al ícono. Es
   * decorativa: el mensaje lo dan siempre el título y la descripción.
   */
  illustration?: IllustrationName
  title: string
  description?: string
  action?: ReactNode
  /**
   * 'status' (default) para vacíos: el lector lo anuncia sin interrumpir.
   * 'alert' para errores: se anuncia de inmediato.
   */
  role?: 'status' | 'alert'
}

/**
 * Estado vacío genérico reutilizable (sin resultados, sin conexión, etc.).
 * `action` recibe cualquier botón ya armado por quien lo use (por ejemplo
 * un <Button variant="outline">Limpiar filtros</Button>).
 */
export const EmptyState = ({ icon: Icon, illustration, title, description, action, role = 'status' }: EmptyStateProps) => (
  <div role={role} className="text-center py-10 px-5">
    {illustration ? (
      <Illustration name={illustration} size="md" className="mb-2" />
    ) : (
      Icon && <Icon className="w-8 h-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
    )}
    <p className="font-display font-bold text-secondary mb-1">{title}</p>
    {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
    {action}
  </div>
)
