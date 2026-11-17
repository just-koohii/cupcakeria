import { between, eq } from "drizzle-orm";
import type { SalesReport } from "./types";
import { getDb } from "@/db/client.server";
import type { PaymentMethod } from "@/db/enums";
import { orderItems, orders, products } from "@/db/schema";
import { NON_REVENUE_STATUSES } from "@/features/orders/constants";
import { endOfDay, enumerateDays, startOfDay, toDayKey } from "@/utils/dates";

export const buildSalesReport = (from: string, to: string): SalesReport => {
  const db = getDb();
  const range = between(orders.createdAt, startOfDay(from), endOfDay(to));
  const periodOrders = db.select().from(orders).where(range).all();
  const valid = periodOrders.filter((order) => !NON_REVENUE_STATUSES.includes(order.status));
  const validIds = new Set(valid.map((order) => order.id));

  const lines = db
    .select({
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      name: orderItems.productName,
      unitPriceCents: orderItems.unitPriceCents,
      quantity: orderItems.quantity,
      category: products.category,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(range)
    .all()
    .filter((line) => validIds.has(line.orderId));

  const revenueCents = valid.reduce((sum, order) => sum + order.totalCents, 0);

  const byDayMap = new Map(
    enumerateDays(from, to).map((day) => [day, { orders: 0, revenueCents: 0 }]),
  );
  for (const order of valid) {
    const bucket = byDayMap.get(toDayKey(order.createdAt));
    if (bucket) {
      bucket.orders += 1;
      bucket.revenueCents += order.totalCents;
    }
  }

  const byProductMap = new Map<string, SalesReport["byProduct"][number]>();
  const byCategoryMap = new Map<string, SalesReport["byCategory"][number]>();
  for (const line of lines) {
    const category = line.category ?? "Removidos";
    const key = line.productId ? `id:${line.productId}` : `name:${line.name}`;
    const product = byProductMap.get(key) ?? {
      productId: line.productId,
      name: line.name,
      category,
      quantity: 0,
      revenueCents: 0,
    };
    product.quantity += line.quantity;
    product.revenueCents += line.quantity * line.unitPriceCents;
    byProductMap.set(key, product);

    const cat = byCategoryMap.get(category) ?? { category, quantity: 0, revenueCents: 0 };
    cat.quantity += line.quantity;
    cat.revenueCents += line.quantity * line.unitPriceCents;
    byCategoryMap.set(category, cat);
  }

  const byPaymentMap = new Map<PaymentMethod, { orders: number; revenueCents: number }>();
  for (const order of valid) {
    const bucket = byPaymentMap.get(order.paymentMethod) ?? { orders: 0, revenueCents: 0 };
    bucket.orders += 1;
    bucket.revenueCents += order.totalCents;
    byPaymentMap.set(order.paymentMethod, bucket);
  }

  return {
    from,
    to,
    summary: {
      orders: valid.length,
      revenueCents,
      averageTicketCents: valid.length ? Math.round(revenueCents / valid.length) : 0,
      itemsSold: lines.reduce((sum, line) => sum + line.quantity, 0),
      cancelledOrders: periodOrders.length - valid.length,
      customers: new Set(valid.map((order) => order.userId)).size,
    },
    byDay: [...byDayMap.entries()].map(([day, value]) => ({ day, ...value })),
    byProduct: [...byProductMap.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    byCategory: [...byCategoryMap.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    byPaymentMethod: [...byPaymentMap.entries()]
      .map(([method, value]) => ({ method, ...value }))
      .sort((a, b) => b.revenueCents - a.revenueCents),
  };
};
