import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseCustomerRepository } from "@/infrastructure/supabase/repositories/supabase-customer.repository";
import type { CustomerRepository } from "@/domain/repositories/customer.repository";

const CustomerContext = createContext<CustomerRepository | undefined>(undefined);

const repository = new SupabaseCustomerRepository();

export function CustomerProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomerRepository(): CustomerRepository {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomerRepository debe usarse dentro de <CustomerProvider>.");
  return ctx;
}
