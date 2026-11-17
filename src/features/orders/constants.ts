import type { OrderStatus, PaymentMethod } from "@/db/enums";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: "Aguardando pagamento",
  pago: "Pago",
  em_preparo: "Em preparo",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  cartao: "Cartão de crédito",
  dinheiro: "Dinheiro na entrega",
};

export const CUSTOMER_CANCELLABLE: OrderStatus[] = ["pendente", "pago"];

export const NON_REVENUE_STATUSES: OrderStatus[] = ["cancelado"];
