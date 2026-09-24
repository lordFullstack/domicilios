import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { LoadingState } from '@/shared/components/LoadingState'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { AccountInactiveScreen } from '@/features/auth/components/AccountInactiveScreen'

const ROUTE_BY_ROLE: Record<string, string> = {
  [USER_ROLES.CLIENT]: ROUTES.CLIENT_HOME,
  [USER_ROLES.RESTAURANT]: ROUTES.RESTAURANT_DASHBOARD,
  [USER_ROLES.DELIVERY]: ROUTES.DELIVERY_DASHBOARD,
  [USER_ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
}

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
    return <LoadingState fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Cuenta sin activar o desactivada por el admin (restaurantes y domiciliarios nuevos
  // nacen inactivos). El admin nunca queda bloqueado por esta regla.
  if (user && user.active === false && user.role !== USER_ROLES.ADMIN) {
    return <AccountInactiveScreen />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to={ROUTE_BY_ROLE[user?.role || ''] || ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}
