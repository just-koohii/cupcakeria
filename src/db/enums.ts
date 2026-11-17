export const USER_ROLES = ["admin", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = [
  "pendente",
  "pago",
  "em_preparo",
  "saiu_para_entrega",
  "entregue",
  "cancelado",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["pix", "cartao", "dinheiro"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
