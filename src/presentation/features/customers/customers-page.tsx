import { Mail, Phone } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { useCustomers } from "@/presentation/features/customers/use-customers";
import { CustomerFormDialog } from "@/presentation/features/customers/customer-form-dialog";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import { Button } from "@/presentation/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

export function CustomersPage() {
  const canCreate = usePermission("customers.create");
  const canUpdate = usePermission("customers.update");
  const canDelete = usePermission("customers.delete");
  const { customers, isLoading, createCustomer, updateCustomer, deactivateCustomer } = useCustomers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Clientes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {customers.length} cliente{customers.length !== 1 && "s"} activo
            {customers.length !== 1 && "s"}
          </p>
        </div>
        {canCreate && <CustomerFormDialog onSubmit={createCustomer} />}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no hay clientes</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cargá tus clientes para poder asociarlos a las ventas.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{customer.name}</p>
                    {customer.taxId && (
                      <p className="font-data text-xs text-muted-foreground">{customer.taxId}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {customer.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3" /> {customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3" /> {customer.email}
                        </span>
                      )}
                      {!customer.phone && !customer.email && "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {canUpdate && (
                        <CustomerFormDialog
                          customer={customer}
                          onSubmit={(input) => updateCustomer(customer.id, input)}
                        />
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deactivateCustomer(customer)}
                        >
                          Desactivar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
