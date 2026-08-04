import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { ProtectedRoute } from './ProtectedRoute'

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

// Client Pages
import { HomePage } from '@/features/client/pages/HomePage'
import { RestaurantListPage } from '@/features/client/pages/RestaurantListPage'
import { CartPage } from '@/features/client/pages/CartPage'
import { OrdersPage } from '@/features/client/pages/OrdersPage'

// Restaurant Pages
import { RestaurantDashboard } from '@/features/restaurant/pages/DashboardPage'
import { RestaurantOrdersPage } from '@/features/restaurant/pages/OrdersPage'

// Delivery Pages
import { DeliveryDashboard } from '@/features/delivery/pages/DashboardPage'

// Admin Pages
import { AdminDashboard } from '@/features/admin/pages/DashboardPage'

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Client */}
        <Route
          path={ROUTES.CLIENT_HOME}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLIENT_RESTAURANTS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <RestaurantListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLIENT_CART}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLIENT_ORDERS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Restaurant */}
        <Route
          path={ROUTES.RESTAURANT_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.RESTAURANT_ORDERS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
              <RestaurantOrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Delivery */}
        <Route
          path={ROUTES.DELIVERY_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY]}>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
