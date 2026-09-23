import { AlertTriangle, Lock, WifiOff, LucideIcon } from 'lucide-react'
import { LoadErrorKind } from '@/hooks/useLocalData'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/Button'

const COPY: Record<LoadErrorKind, { icon: LucideIcon; title: string; description: string }> = {
  network: {
    icon: WifiOff,
    title: 'Sin conexión',
    description: 'Revisa tu internet e intenta de nuevo.',
  },
  permission: {
    icon: Lock,
    title: 'No pudimos verificar tu sesión',
    description: 'Cierra sesión y vuelve a entrar. Si sigue pasando, escríbenos.',
  },
  unknown: {
    icon: AlertTriangle,
    title: 'No pudimos cargar los restaurantes',
    description: 'Intenta de nuevo en un momento.',
  },
}

interface RestaurantLoadErrorProps {
  kind: LoadErrorKind | null
  onRetry: () => void
  retrying: boolean
}

/**
 * Error de carga con copy según la causa — nunca el mensaje crudo de
 * Supabase. role="alert" (vía EmptyState) para que se anuncie de inmediato.
 */
export const RestaurantLoadError = ({ kind, onRetry, retrying }: RestaurantLoadErrorProps) => {
  const { icon, title, description } = COPY[kind ?? 'unknown']
  return (
    <EmptyState
      role="alert"
      icon={icon}
      title={title}
      description={description}
      action={
        <Button variant="tertiary" onClick={onRetry} loading={retrying}>
          Reintentar
        </Button>
      }
    />
  )
}
