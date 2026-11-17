import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CUSTOMER_CANCELLABLE, PAYMENT_METHOD_LABELS } from "../constants";
import { cancelMyOrder } from "../orders.functions";
import { myOrdersQueryOptions } from "../queries";
import { OrderStatusBadge } from "./order-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import type { OrderStatus } from "@/db/enums";
import { formatCurrency, formatDateTime } from "@/utils/format";

const PROGRESS: OrderStatus[] = ["pago", "em_preparo", "saiu_para_entrega", "entregue"];
const PROGRESS_LABELS = ["Pago", "Em preparo", "A caminho", "Entregue"];

function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "cancelado") {
    return null;
  }
  const current = PROGRESS.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Andamento do pedido">
      {PROGRESS_LABELS.map((label, index) => (
        <li key={label} className="flex flex-col gap-1">
          <span className={`h-1.5 rounded-full ${index <= current ? "bg-primary" : "bg-muted"}`} />
          <span
            className={`text-[11px] sm:text-xs ${index <= current ? "font-medium text-foreground" : "text-muted-foreground"}`}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function CancelOrderButton({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => cancelMyOrder({ data: orderId }),
    onSuccess: () => {
      toast.add({ title: `Pedido #${orderId} cancelado`, type: "success" });
      return queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) =>
      toast.add({ title: "Não foi possível cancelar", description: error.message, type: "error" }),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="destructive" size="sm" />}>
        Cancelar pedido
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar o pedido #{orderId}?</AlertDialogTitle>
          <AlertDialogDescription>
            Se o pagamento já foi feito, o estorno é realizado automaticamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => mutation.mutate()}>
            Cancelar pedido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function MyOrdersPage() {
  const { data: orders } = useSuspenseQuery(myOrdersQueryOptions());

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Meus pedidos</h1>
      {orders.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Você ainda não fez pedidos</EmptyTitle>
            <EmptyDescription>Seus pedidos aparecerão aqui para acompanhamento.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/produtos" className={buttonVariants()}>
              Ver cardápio
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Pedido #{order.id}</CardTitle>
                <CardDescription>
                  {formatDateTime(order.createdAt)} · {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </CardDescription>
                <CardAction>
                  <OrderStatusBadge status={order.status} />
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <OrderProgress status={order.status} />
                <ul className="flex flex-col gap-1 text-sm">
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
                <p className="text-sm text-muted-foreground">Entrega: {order.deliveryAddress}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-3">
                <span className="font-semibold">Total: {formatCurrency(order.totalCents)}</span>
                {CUSTOMER_CANCELLABLE.includes(order.status) && (
                  <CancelOrderButton orderId={order.id} />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
