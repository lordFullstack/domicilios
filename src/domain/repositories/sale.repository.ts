import type { Sale, SaleItemDraft } from "@/domain/entities/sale.entity";

export interface CreateSaleInput {
  customerId: string | null;
  customerName: string | null;
  notes: string | null;
  items: SaleItemDraft[];
}

export interface SaleRepository {
  listSales(): Promise<Sale[]>;
  createSale(input: CreateSaleInput): Promise<Sale>;
  cancelSale(saleId: string): Promise<void>;
}
