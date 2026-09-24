import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { ErrorState } from '@/shared/components/ErrorState'
import { ERROR_COPY } from '@/shared/constants/stateCopy'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/config/constants'

/**
 * 404 real. Funciona con o sin sesión: con sesión vuelve al inicio del
 * cliente; sin sesión lleva a iniciar sesión (antes toda ruta desconocida
 * redirigía al login sin explicar nada).
 */
export const NotFound = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  return (
    <ErrorState
      fullScreen
      className="safe-top safe-bottom"
      illustration={ERROR_COPY.notFound.illustration}
      title={ERROR_COPY.notFound.title}
      description={ERROR_COPY.notFound.description}
      action={
        !loading &&
        (isAuthenticated ? (
          <Button variant="gradient" size="lg" onClick={() => navigate(ROUTES.CLIENT_HOME, { replace: true })}>
            Volver al inicio
          </Button>
        ) : (
          <Button variant="gradient" size="lg" onClick={() => navigate(ROUTES.LOGIN, { replace: true })}>
            Iniciar sesión
          </Button>
        ))
      }
    />
  )
}
