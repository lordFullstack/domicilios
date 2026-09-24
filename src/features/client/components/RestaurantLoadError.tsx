import { LoadErrorKind } from '@/hooks/useLocalData'
import { ErrorState } from '@/shared/components/ErrorState'
import { ERROR_COPY } from '@/shared/constants/stateCopy'

const COPY: Record<LoadErrorKind, typeof ERROR_COPY.restaurantsNetwork | typeof ERROR_COPY.restaurantsPermission | typeof ERROR_COPY.restaurantsUnknown> = {
  network: ERROR_COPY.restaurantsNetwork,
  permission: ERROR_COPY.restaurantsPermission,
  unknown: ERROR_COPY.restaurantsUnknown,
}

interface RestaurantLoadErrorProps {
  kind: LoadErrorKind | null
  onRetry: () => void
  retrying: boolean
}

/**
 * Error de carga con copy según la causa — nunca el mensaje crudo de
 * Supabase. role="alert" (vía ErrorState) para que se anuncie de inmediato.
 */
export const RestaurantLoadError = ({ kind, onRetry, retrying }: RestaurantLoadErrorProps) => {
  const copy = COPY[kind ?? 'unknown']
  return (
    <ErrorState
      illustration={copy.illustration}
      title={copy.title}
      description={copy.description}
      retryLabel={copy.cta}
      onRetry={onRetry}
      retrying={retrying}
    />
  )
}
