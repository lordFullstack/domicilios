import type { CustomerInput, CustomerRepository } from "@/domain/repositories/customer.repository";
import type { Customer } from "@/domain/entities/customer.entity";

export class InvalidCustomerDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCustomerDataError";
  }
}

function validate(input: CustomerInput): void {
  if (input.name.trim().length < 2) {
    throw new InvalidCustomerDataError("El nombre debe tener al menos 2 caracteres.");
  }
}

export async function createCustomerUseCase(
  repository: CustomerRepository,
  input: CustomerInput,
): Promise<Customer> {
  validate(input);
  return repository.createCustomer(input);
}

export async function updateCustomerUseCase(
  repository: CustomerRepository,
  id: string,
  input: CustomerInput,
): Promise<Customer> {
  validate(input);
  return repository.updateCustomer(id, input);
}
