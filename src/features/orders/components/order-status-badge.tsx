import { ORDER_STATUS_LABELS } from "../constants";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/db/enums";

const VARIANTS: Record<OrderStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  pendente: "outline",
  pago: "secondary",
  em_preparo: "secondary",
  saiu_para_entrega: "default",
  entregue: "default",
  cancelado: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
