import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { ProtectedRoute } from './ProtectedRoute'

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

// Client Pages
import { ClientDashboardPage } from '@/features/client/pages/ClientDashboardPage'
import { RestaurantListPage } from '@/features/client/pages/RestaurantListPage'
import { RestaurantDetailPage } from '@/features/client/pages/RestaurantDetailPage'
import { CartPage } from '@/features/client/pages/CartPage'
import { CheckoutPage } from '@/features/client/pages/CheckoutPage'
import { OrdersPage } from '@/features/client/pages/OrdersPage'
import { OrderDetailPage } from '@/features/client/pages/OrderDetailPage'

// Restaurant Pages
import { RestaurantDashboard } from '@/features/restaurant/pages/DashboardPage'
import { RestaurantOrdersPage } from '@/features/restaurant/pages/OrdersPage'
import { MenuManagementPage } from '@/features/restaurant/pages/MenuManagementPage'

// Delivery Pages
import { DeliveryDashboard } from '@/features/delivery/pages/DashboardPage'

// Admin Pages
import { AdminDashboard } from '@/features/admin/pages/DashboardPage'

// Design System (preview interno)
import { DesignSystemPage } from '@/features/design-system/DesignSystemPage'

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />

        {/* Client */}
        <Route
          path={ROUTES.CLIENT_HOME}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <ClientDashboardPage />
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
          path={ROUTES.CLIENT_RESTAURANT}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <RestaurantDetailPage />
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
          path={ROUTES.CLIENT_CHECKOUT}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <CheckoutPage />
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
        <Route
          path={ROUTES.CLIENT_ORDER}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
              <OrderDetailPage />
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
        <Route
          path={ROUTES.RESTAURANT_PRODUCTS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
              <MenuManagementPage />
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
