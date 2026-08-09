import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/config/constants'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to={ROUTES.CLIENT_HOME} replace />
  }

  return <>{children}</>
}
