import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import type { Customer } from "@/domain/entities/customer.entity";
import type { Perfume } from "@/domain/entities/perfume.entity";
import type { CreateSaleInput } from "@/domain/repositories/sale.repository";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

interface ItemRow {
  key: string;
  perfumeId: string;
  quantity: string;
}

function emptyRow(): ItemRow {
  return { key: crypto.randomUUID(), perfumeId: "", quantity: "1" };
}

interface SaleFormDialogProps {
  perfumes: Perfume[];
  customers: Customer[];
  onSubmit: (input: CreateSaleInput) => Promise<boolean>;
}

export function SaleFormDialog({ perfumes, customers, onSubmit }: SaleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState<string>("__walk_in__");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);

  function resetForm() {
    setCustomerId("__walk_in__");
    setCustomerName("");
    setNotes("");
    setRows([emptyRow()]);
  }

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const estimatedTotal = rows.reduce((sum, r) => {
    const perfume = perfumes.find((p) => p.id === r.perfumeId);
    if (!perfume) return sum;
    return sum + (Number(r.quantity) || 0) * perfume.basePrice;
  }, 0);

  const hasValidItem = rows.some((r) => r.perfumeId && Number(r.quantity) > 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit({
      customerId: customerId === "__walk_in__" ? null : customerId,
      customerName: customerId === "__walk_in__" ? customerName.trim() || null : null,
      notes: notes.trim() || null,
      items: rows
        .filter((r) => r.perfumeId)
        .map((r) => ({
          perfumeId: r.perfumeId,
          quantity: Number(r.quantity) || 0,
        })),
    });

    setIsSubmitting(false);
    if (success) {
      setOpen(false);
      resetForm();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nueva venta
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar venta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <Select value={customerId} onValueChange={setCustomerId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__walk_in__">Consumidor final</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {customerId === "__walk_in__" && (
              <Input
                placeholder="Nombre (opcional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isSubmitting}
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Label>Ítems</Label>
            {rows.map((row, index) => (
              <div key={row.key} className="flex flex-col gap-2 rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Select
                    value={row.perfumeId}
                    onValueChange={(v) => updateRow(row.key, { perfumeId: v })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Perfume" />
                    </SelectTrigger>
                    <SelectContent>
                      {perfumes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — ${p.basePrice.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar ítem"
                      onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder={`Cantidad${index === 0 ? " *" : ""}`}
                  required
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
              disabled={isSubmitting}
            >
              <Plus className="size-4" />
              Agregar ítem
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Total estimado</span>
            <span className="font-data font-medium text-foreground">${estimatedTotal.toFixed(2)}</span>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            El precio final se calcula en el servidor al confirmar.
          </p>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isSubmitting || !hasValidItem}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Registrando…" : "Registrar venta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
