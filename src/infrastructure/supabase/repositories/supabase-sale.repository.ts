import type { CreateSaleInput, SaleRepository } from "@/domain/repositories/sale.repository";
import type { Sale, SaleStatus } from "@/domain/entities/sale.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawSaleItemRow {
  id: string;
  perfume_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  perfumes: { name: string } | null;
}

interface RawSaleRow {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  subtotal: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  sale_items: RawSaleItemRow[];
}

const SELECT_WITH_JOINS = `
  id, customer_id, customer_name, subtotal, total, status, notes, created_at,
  sale_items (
    id, perfume_id, quantity, unit_price, subtotal,
    perfumes:perfume_id ( name )
  )
`;

function mapRow(row: RawSaleRow): Sale {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: row.status as SaleStatus,
    notes: row.notes,
    createdAt: row.created_at,
    items: (row.sale_items ?? []).map((item) => ({
      id: item.id,
      perfumeId: item.perfume_id,
      perfumeName: item.perfumes?.name ?? "—",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.subtotal),
    })),
  };
}

export class SupabaseSaleRepository implements SaleRepository {
  async listSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from("sales")
      .select<string, RawSaleRow>(SELECT_WITH_JOINS)
      .order("created_at", { ascending: false });

    if (error) throw new Error("No se pudieron cargar las ventas.");
    return (data ?? []).map(mapRow);
  }

  async createSale(input: CreateSaleInput): Promise<Sale> {
    const { data, error } = await supabase.rpc("create_sale", {
      p_items: input.items.map((item) => ({
        perfume_id: item.perfumeId,
        quantity: item.quantity,
      })),
      p_customer_name: input.customerName ?? undefined,
      p_notes: input.notes ?? undefined,
      p_customer_id: input.customerId ?? undefined,
    });

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo registrar la venta.");
    }

    return this.getSaleById((data as { id: string }).id);
  }

  async cancelSale(saleId: string): Promise<void> {
    const { error } = await supabase.rpc("cancel_sale", { p_sale_id: saleId });
    if (error) throw new Error(error.message ?? "No se pudo cancelar la venta.");
  }

  private async getSaleById(id: string): Promise<Sale> {
    const { data, error } = await supabase
      .from("sales")
      .select<string, RawSaleRow>(SELECT_WITH_JOINS)
      .eq("id", id)
      .single();

    if (error || !data) throw new Error("No se pudo recargar la venta registrada.");
    return mapRow(data);
  }
}
