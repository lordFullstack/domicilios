import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ROUTES, USER_ROLES } from '@/config/constants'
import { ProtectedRoute } from './ProtectedRoute'

// Auth Pages (eager: son el punto de entrada, no vale la pena diferirlas)
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

// Client Pages (lazy: se cargan solo cuando se visitan)
const ClientDashboardPage = lazy(() =>
  import('@/features/client/pages/ClientDashboardPage').then((m) => ({ default: m.ClientDashboardPage }))
)
const RestaurantListPage = lazy(() =>
  import('@/features/client/pages/RestaurantListPage').then((m) => ({ default: m.RestaurantListPage }))
)
const RestaurantDetailPage = lazy(() =>
  import('@/features/client/pages/RestaurantDetailPage').then((m) => ({ default: m.RestaurantDetailPage }))
)
const CartPage = lazy(() =>
  import('@/features/client/pages/CartPage').then((m) => ({ default: m.CartPage }))
)
const CheckoutPage = lazy(() =>
  import('@/features/client/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
)
const OrdersPage = lazy(() =>
  import('@/features/client/pages/OrdersPage').then((m) => ({ default: m.OrdersPage }))
)
const OrderDetailPage = lazy(() =>
  import('@/features/client/pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage }))
)

// Restaurant Pages
const RestaurantDashboard = lazy(() =>
  import('@/features/restaurant/pages/DashboardPage').then((m) => ({ default: m.RestaurantDashboard }))
)
const RestaurantOrdersPage = lazy(() =>
  import('@/features/restaurant/pages/OrdersPage').then((m) => ({ default: m.RestaurantOrdersPage }))
)
const MenuManagementPage = lazy(() =>
  import('@/features/restaurant/pages/MenuManagementPage').then((m) => ({ default: m.MenuManagementPage }))
)

// Delivery Pages
const DeliveryDashboard = lazy(() =>
  import('@/features/delivery/pages/DashboardPage').then((m) => ({ default: m.DeliveryDashboard }))
)
const DeliveryProfilePage = lazy(() =>
  import('@/features/delivery/pages/ProfilePage').then((m) => ({ default: m.DeliveryProfilePage }))
)

// Admin Pages
const AdminDashboard = lazy(() =>
  import('@/features/admin/pages/DashboardPage').then((m) => ({ default: m.AdminDashboard }))
)
const AdminUsersPage = lazy(() =>
  import('@/features/admin/pages/UsersPage').then((m) => ({ default: m.AdminUsersPage }))
)
const AdminRestaurantsPage = lazy(() =>
  import('@/features/admin/pages/RestaurantsPage').then((m) => ({ default: m.AdminRestaurantsPage }))
)
const AdminOrdersPage = lazy(() =>
  import('@/features/admin/pages/OrdersPage').then((m) => ({ default: m.AdminOrdersPage }))
)
const AdminPromotionsPage = lazy(() =>
  import('@/features/admin/pages/PromotionsPage').then((m) => ({ default: m.AdminPromotionsPage }))
)

const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
  </div>
)

export const Router = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

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
        <Route
          path={ROUTES.DELIVERY_PROFILE}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY]}>
              <DeliveryProfilePage />
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
        <Route
          path={ROUTES.ADMIN_USERS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_RESTAURANTS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminRestaurantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ORDERS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PROMOTIONS}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminPromotionsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
