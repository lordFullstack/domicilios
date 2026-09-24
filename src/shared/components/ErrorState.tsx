import { ReactNode } from 'react'
import clsx from 'clsx'
import { Illustration, type IllustrationName } from '@/shared/illustrations'
import { Button } from './Button'

interface ErrorStateBase {
  /** Ilustración del cohete: 'sad' (fallo) por defecto; 'confused' para "no encontrado". */
  illustration?: IllustrationName
  title: string
  description?: string
  /** Pantalla completa (ErrorBoundary, 404): el título es el h1. En línea, es un párrafo. */
  fullScreen?: boolean
  className?: string
}

/** Todo error ofrece una salida: reintentar o una acción propia (navegar). */
type ErrorStateProps = ErrorStateBase &
  (
    | { onRetry: () => void; retryLabel?: string; retrying?: boolean; action?: ReactNode }
    | { action: ReactNode; onRetry?: undefined; retryLabel?: undefined; retrying?: undefined }
  )

/**
 * Estado de error único (LOOP_VISUAL_08): ilustración + título + descripción
 * + salida. role="alert" para que se anuncie de inmediato. La ilustración es
 * decorativa: el mensaje lo dan el título y la descripción.
 */
export const ErrorState = ({
  illustration = 'sad',
  title,
  description,
  fullScreen = false,
  className,
  onRetry,
  retryLabel = 'Reintentar',
  retrying = false,
  action,
}: ErrorStateProps) => {
  const Title = fullScreen ? 'h1' : 'p'
  return (
    <div
      role="alert"
      className={clsx(
        'text-center px-5',
        fullScreen ? 'flex min-h-screen items-center justify-center bg-white px-8' : 'py-10',
        className
      )}
    >
      <div className={clsx(fullScreen && 'mx-auto w-full max-w-md')}>
        <Illustration name={illustration} size={fullScreen ? 'lg' : 'md'} className="mb-2" />
        <Title className={clsx('font-display font-bold text-secondary mb-1', fullScreen ? 'text-xl' : 'text-lg')}>{title}</Title>
        {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
        {(onRetry || action) && (
          <div className="flex flex-col items-center gap-2">
            {onRetry && (
              <Button variant={fullScreen ? 'gradient' : 'tertiary'} onClick={onRetry} loading={retrying}>
                {retryLabel}
              </Button>
            )}
            {action}
          </div>
        )}
      </div>
    </div>
  )
}
