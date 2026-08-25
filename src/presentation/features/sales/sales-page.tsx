import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { usePerfumes } from "@/presentation/features/recipes/use-perfumes";
import { useCustomers } from "@/presentation/features/customers/use-customers";
import { useSales } from "@/presentation/features/sales/use-sales";
import { SaleFormDialog } from "@/presentation/features/sales/sale-form-dialog";
import { Badge } from "@/presentation/components/ui/badge";
import { Button } from "@/presentation/components/ui/button";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

export function SalesPage() {
  const canCreate = usePermission("sales.create");
  const canCancel = usePermission("sales.cancel");

  const { perfumes } = usePerfumes();
  const { customers } = useCustomers();
  const { sales, isLoading, cancellingId, createSale, cancelSale } = useSales();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Ventas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sales.length} venta{sales.length !== 1 && "s"} registrada{sales.length !== 1 && "s"}
          </p>
        </div>
        {canCreate && (
          <SaleFormDialog
            perfumes={perfumes.filter((p) => p.isActive)}
            customers={customers}
            onSubmit={createSale}
          />
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no hay ventas registradas</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Registrá una venta eligiendo los perfumes y las cantidades entregadas.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Cliente</TableHead>
                <TableHead>Ítems</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const isExpanded = expandedId === sale.id;
                const isCancelling = cancellingId === sale.id;

                return (
                  <Fragment key={sale.id}>
                    <TableRow className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : sale.id)}>
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {sale.customerName ?? "Consumidor final"}
                      </TableCell>
                      <TableCell className="font-data text-sm text-muted-foreground">
                        {sale.items.length}
                      </TableCell>
                      <TableCell className="font-data text-sm font-medium text-foreground">
                        ${sale.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.status === "completed" ? "success" : "outline"}>
                          {sale.status === "completed" ? "Completada" : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {canCancel && sale.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isCancelling}
                            onClick={() => cancelSale(sale)}
                          >
                            {isCancelling && <Loader2 className="size-3.5 animate-spin" />}
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="bg-muted/30 py-3">
                          <div className="flex flex-col gap-1.5 pl-8">
                            {sale.notes && (
                              <p className="mb-1 text-sm italic text-muted-foreground">{sale.notes}</p>
                            )}
                            {sale.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm text-muted-foreground"
                              >
                                <span className="text-foreground">
                                  {item.quantity} × {item.perfumeName}
                                </span>
                                <span className="font-data">
                                  ${item.unitPrice.toFixed(2)} c/u = ${item.subtotal.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
