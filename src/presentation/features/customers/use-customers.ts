import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Customer } from "@/domain/entities/customer.entity";
import type { CustomerInput } from "@/domain/repositories/customer.repository";
import { createCustomerUseCase, updateCustomerUseCase } from "@/domain/use-cases/manage-customer.use-case";
import { useCustomerRepository } from "@/presentation/hooks/use-customer-management";

export function useCustomers() {
  const repository = useCustomerRepository();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setCustomers(await repository.listCustomers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los clientes.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createCustomer(input: CustomerInput): Promise<boolean> {
    try {
      const created = await createCustomerUseCase(repository, input);
      setCustomers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Cliente "${created.name}" creado.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el cliente.");
      return false;
    }
  }

  async function updateCustomer(id: string, input: CustomerInput): Promise<boolean> {
    try {
      const updated = await updateCustomerUseCase(repository, id, input);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(`Cliente "${updated.name}" actualizado.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el cliente.");
      return false;
    }
  }

  async function deactivateCustomer(customer: Customer) {
    try {
      await repository.setCustomerActive(customer.id, false);
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      toast.success(`Cliente "${customer.name}" desactivado.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el cliente.");
    }
  }

  return { customers, isLoading, createCustomer, updateCustomer, deactivateCustomer };
}
