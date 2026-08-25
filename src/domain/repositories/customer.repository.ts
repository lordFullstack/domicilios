import type { Customer } from "@/domain/entities/customer.entity";

export interface CustomerInput {
  name: string;
  taxId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface CustomerRepository {
  listCustomers(): Promise<Customer[]>;
  createCustomer(input: CustomerInput): Promise<Customer>;
  updateCustomer(id: string, input: CustomerInput): Promise<Customer>;
  setCustomerActive(id: string, isActive: boolean): Promise<void>;
}
