import type { CustomerInput, CustomerRepository } from "@/domain/repositories/customer.repository";
import type { Customer } from "@/domain/entities/customer.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawCustomerRow {
  id: string;
  name: string;
  tax_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
}

const COLUMNS = "id, name, tax_id, phone, email, address, is_active";

function mapRow(row: RawCustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    taxId: row.tax_id,
    phone: row.phone,
    email: row.email,
    address: row.address,
    isActive: row.is_active,
  };
}

async function getCurrentBranchId(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("No hay sesión activa.");

  const { data, error } = await supabase.from("profiles").select("branch_id").eq("id", userId).single();
  if (error || !data) throw new Error("No se pudo determinar la sucursal del usuario.");
  return data.branch_id;
}

export class SupabaseCustomerRepository implements CustomerRepository {
  async listCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select(COLUMNS)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudieron cargar los clientes.");
    return (data ?? []).map(mapRow);
  }

  async createCustomer(input: CustomerInput): Promise<Customer> {
    const branchId = await getCurrentBranchId();

    const { data, error } = await supabase
      .from("customers")
      .insert({
        branch_id: branchId,
        name: input.name.trim(),
        tax_id: input.taxId,
        phone: input.phone,
        email: input.email,
        address: input.address,
      })
      .select(COLUMNS)
      .single();

    if (error || !data) throw new Error("No se pudo crear el cliente.");
    return mapRow(data);
  }

  async updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: input.name.trim(),
        tax_id: input.taxId,
        phone: input.phone,
        email: input.email,
        address: input.address,
      })
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error || !data) throw new Error("No se pudo actualizar el cliente.");
    return mapRow(data);
  }

  async setCustomerActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from("customers").update({ is_active: isActive }).eq("id", id);
    if (error) throw new Error("No se pudo actualizar el estado del cliente.");
  }
}
