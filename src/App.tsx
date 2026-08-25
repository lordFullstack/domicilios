import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/presentation/hooks/use-auth";
import { UserManagementProvider } from "@/presentation/hooks/use-user-management";
import { SupplyProvider } from "@/presentation/hooks/use-supply-management";
import { SupplierProvider } from "@/presentation/hooks/use-supplier-management";
import { PurchaseProvider } from "@/presentation/hooks/use-purchase-management";
import { PerfumeProvider } from "@/presentation/hooks/use-perfume-management";
import { RecipeProvider } from "@/presentation/hooks/use-recipe-management";
import { ProductionProvider } from "@/presentation/hooks/use-production-management";
import { SaleProvider } from "@/presentation/hooks/use-sale-management";
import { CashProvider } from "@/presentation/hooks/use-cash-management";
import { CustomerProvider } from "@/presentation/hooks/use-customer-management";
import { ThemeProvider } from "@/presentation/hooks/theme-provider";
import { ProtectedRoute } from "@/presentation/routes/protected-route";
import { RequirePermission } from "@/presentation/routes/require-permission";
import { ModulePlaceholderRoute } from "@/presentation/routes/module-placeholder-route";
import { AppLayout } from "@/presentation/layouts/app-layout";
import { LoginPage } from "@/presentation/features/auth/login-page";
import { DashboardPage } from "@/presentation/features/dashboard/dashboard-page";
import { UsersPage } from "@/presentation/features/users/users-page";
import { InventoryPage } from "@/presentation/features/inventory/inventory-page";
import { SuppliersPage } from "@/presentation/features/suppliers/suppliers-page";
import { PurchasesPage } from "@/presentation/features/purchases/purchases-page";
import { RecipesPage } from "@/presentation/features/recipes/recipes-page";
import { ProductionPage } from "@/presentation/features/production/production-page";
import { SalesPage } from "@/presentation/features/sales/sales-page";
import { CashPage } from "@/presentation/features/cash/cash-page";
import { CustomersPage } from "@/presentation/features/customers/customers-page";
import { Toaster } from "@/presentation/components/ui/sonner";

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <UserManagementProvider>
            <SupplyProvider>
              <SupplierProvider>
                <PurchaseProvider>
                  <PerfumeProvider>
                    <RecipeProvider>
                      <ProductionProvider>
                        <CustomerProvider>
                          <SaleProvider>
                            <CashProvider>
                              <Routes>
                                <Route path="/login" element={<LoginPage />} />

                                <Route element={<ProtectedRoute />}>
                                  <Route element={<AppLayout />}>
                                    <Route
                                      path="/"
                                      element={<DashboardPage />}
                                    />

                                    <Route
                                      path="/reportes"
                                      element={<ModulePlaceholderRoute />}
                                    />
                                    <Route
                                      path="/catalogo"
                                      element={<ModulePlaceholderRoute />}
                                    />
                                    <Route
                                      path="/auditoria"
                                      element={<ModulePlaceholderRoute />}
                                    />
                                    <Route
                                      path="/configuracion"
                                      element={<ModulePlaceholderRoute />}
                                    />

                                    <Route
                                      element={
                                        <RequirePermission permission="users.read" />
                                      }
                                    >
                                      <Route
                                        path="/usuarios"
                                        element={<UsersPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="inventory.read" />
                                      }
                                    >
                                      <Route
                                        path="/insumos"
                                        element={<InventoryPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="suppliers.read" />
                                      }
                                    >
                                      <Route
                                        path="/proveedores"
                                        element={<SuppliersPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="purchases.read" />
                                      }
                                    >
                                      <Route
                                        path="/compras"
                                        element={<PurchasesPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="recipes.read" />
                                      }
                                    >
                                      <Route
                                        path="/recetas"
                                        element={<RecipesPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="production.read_own" />
                                      }
                                    >
                                      <Route
                                        path="/produccion"
                                        element={<ProductionPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="sales.read_own" />
                                      }
                                    >
                                      <Route
                                        path="/ventas"
                                        element={<SalesPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="cash.open_own" />
                                      }
                                    >
                                      <Route
                                        path="/caja"
                                        element={<CashPage />}
                                      />
                                    </Route>

                                    <Route
                                      element={
                                        <RequirePermission permission="customers.read" />
                                      }
                                    >
                                      <Route
                                        path="/clientes"
                                        element={<CustomersPage />}
                                      />
                                    </Route>

                                    <Route
                                      path="*"
                                      element={<ModulePlaceholderRoute />}
                                    />
                                  </Route>
                                </Route>
                              </Routes>

                              <Toaster
                                position="top-right"
                                richColors
                                closeButton
                              />
                            </CashProvider>
                          </SaleProvider>
                        </CustomerProvider>
                      </ProductionProvider>
                    </RecipeProvider>
                  </PerfumeProvider>
                </PurchaseProvider>
              </SupplierProvider>
            </SupplyProvider>
          </UserManagementProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
