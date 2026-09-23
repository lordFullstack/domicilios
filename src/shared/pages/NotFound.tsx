import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { Illustration } from '@/shared/illustrations'
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
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center px-8 text-center safe-top safe-bottom">
      <Illustration name="confused" size="lg" className="mb-2" />
      <h1 className="font-display text-xl font-bold text-secondary mb-1">No encontramos esta página</h1>
      <p className="text-sm text-gray-500 mb-6">
        Puede que el enlace esté roto o que la página ya no exista.
      </p>
      {!loading &&
        (isAuthenticated ? (
          <Button variant="gradient" size="lg" onClick={() => navigate(ROUTES.CLIENT_HOME, { replace: true })}>
            Volver al inicio
          </Button>
        ) : (
          <Button variant="gradient" size="lg" onClick={() => navigate(ROUTES.LOGIN, { replace: true })}>
            Iniciar sesión
          </Button>
        ))}
    </div>
  )
}
