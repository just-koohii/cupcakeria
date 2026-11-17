import { Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { type listAllOrders, updateOrderStatus } from "../admin-orders.functions";
import { adminOrdersQueryOptions } from "../queries";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ORDER_STATUSES, type OrderStatus } from "@/db/enums";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/features/orders/constants";
import { formatCurrency, formatDateTime } from "@/utils/format";

type AdminOrder = Awaited<ReturnType<typeof listAllOrders>>[number];

function StatusSelect({ order }: { order: AdminOrder }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus({ data: { id: order.id, status } }),
    onSuccess: (updated) => {
      toast.add({
        title: `Pedido #${updated.id} atualizado`,
        description: ORDER_STATUS_LABELS[updated.status],
        type: "success",
      });
      return queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) =>
      toast.add({ title: "Erro ao atualizar", description: error.message, type: "error" }),
  });

  return (
    <NativeSelect
      size="sm"
      aria-label={`Status do pedido #${order.id}`}
      value={order.status}
      disabled={mutation.isPending}
      onChange={(event) => mutation.mutate(event.target.value as OrderStatus)}
    >
      {ORDER_STATUSES.map((status) => (
        <NativeSelectOption key={status} value={status}>
          {ORDER_STATUS_LABELS[status]}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

function OrderDetailsDialog({ order }: { order: AdminOrder }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Detalhes
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pedido #{order.id}</DialogTitle>
          <DialogDescription>
            {formatDateTime(order.createdAt)} · {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between">
            <OrderStatusBadge status={order.status} />
            <span className="font-semibold">{formatCurrency(order.totalCents)}</span>
          </div>
          <ul className="flex flex-col gap-1">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.quantity}× {item.productName}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(item.unitPriceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className="font-medium">{order.customerName}</span>
            <span className="text-muted-foreground">{order.customerEmail}</span>
            <span className="text-muted-foreground">{order.deliveryAddress}</span>
            {order.notes && <span className="italic">Obs.: {order.notes}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Seu pedido #${order.id}`)}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} data-icon="inline-start" />
              E-mail
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminOrdersPage({ status }: { status?: OrderStatus }) {
  const navigate = useNavigate({ from: "/admin/pedidos" });
  const { data: orders } = useSuspenseQuery(adminOrdersQueryOptions(status));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Atualize o status e entre em contato com os clientes.
          </p>
        </div>
        <NativeSelect
          aria-label="Filtrar por status"
          value={status ?? ""}
          onChange={(event) =>
            navigate({
              search: { status: (event.target.value || undefined) as OrderStatus | undefined },
            })
          }
        >
          <NativeSelectOption value="">Todos os status</NativeSelectOption>
          {ORDER_STATUSES.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(order.totalCents)}
                </TableCell>
                <TableCell>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</TableCell>
                <TableCell>
                  <StatusSelect order={order} />
                </TableCell>
                <TableCell className="text-right">
                  <OrderDetailsDialog order={order} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
