export type SaleStatus = "completed" | "cancelled";

export interface SaleItem {
  id: string;
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleItemDraft {
  perfumeId: string;
  quantity: number;
}

export interface Sale {
  id: string;
  customerId: string | null;
  customerName: string | null;
  subtotal: number;
  total: number;
  status: SaleStatus;
  notes: string | null;
  createdAt: string;
  items: SaleItem[];
}
