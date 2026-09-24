import { ReactNode } from 'react'
import clsx from 'clsx'
import { Spinner, type SpinnerSize } from './Spinner'

interface LoadingStateProps {
  /** Texto accesible ("Cargando pedidos"). Es lo que anuncia el lector de pantalla. */
  label?: string
  /**
   * Skeleton con la geometría del contenido (preferido: evita saltos de
   * layout). Sin children se muestra el Spinner único.
   */
  children?: ReactNode
  /** Centra el estado en toda la pantalla (carga de página o de ruta). */
  fullScreen?: boolean
  spinnerSize?: SpinnerSize
  className?: string
}

/**
 * Estado de carga (LOOP_VISUAL_08): o un skeleton (children) o el Spinner
 * único, siempre dentro de un role="status" con nombre accesible.
 */
export const LoadingState = ({
  label = 'Cargando',
  children,
  fullScreen = false,
  spinnerSize = 'lg',
  className,
}: LoadingStateProps) => (
  <div
    role="status"
    aria-label={label}
    className={clsx(
      fullScreen && 'flex min-h-screen items-center justify-center bg-white',
      !fullScreen && !children && 'flex items-center justify-center py-10',
      className
    )}
  >
    {children ?? <Spinner size={spinnerSize} />}
  </div>
)
