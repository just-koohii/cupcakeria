import type { PaymentMethod } from "@/db/enums";

export interface SalesReport {
  from: string;
  to: string;
  summary: {
    orders: number;
    revenueCents: number;
    averageTicketCents: number;
    itemsSold: number;
    cancelledOrders: number;
    customers: number;
  };
  byDay: Array<{ day: string; orders: number; revenueCents: number }>;
  byProduct: Array<{
    productId: number | null;
    name: string;
    category: string;
    quantity: number;
    revenueCents: number;
  }>;
  byCategory: Array<{ category: string; quantity: number; revenueCents: number }>;
  byPaymentMethod: Array<{ method: PaymentMethod; orders: number; revenueCents: number }>;
}
