import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client.server";
import { type Order, type OrderItem, orderItems, orders, users } from "@/db/schema";

export type OrderWithItems = Order & { items: OrderItem[] };

export const attachItems = <T extends Order>(rows: T[]): Array<T & { items: OrderItem[] }> => {
  if (rows.length === 0) {
    return [];
  }
  const items = getDb()
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((row) => row.id),
      ),
    )
    .all();
  const byOrder = new Map<number, OrderItem[]>();
  for (const item of items) {
    byOrder.set(item.orderId, [...(byOrder.get(item.orderId) ?? []), item]);
  }
  return rows.map((row) => ({ ...row, items: byOrder.get(row.id) ?? [] }));
};

export const findOrdersByUser = (userId: number): OrderWithItems[] =>
  attachItems(
    getDb()
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .all(),
  );

export const orderWithCustomerColumns = {
  id: orders.id,
  userId: orders.userId,
  status: orders.status,
  paymentMethod: orders.paymentMethod,
  totalCents: orders.totalCents,
  deliveryAddress: orders.deliveryAddress,
  notes: orders.notes,
  createdAt: orders.createdAt,
  updatedAt: orders.updatedAt,
  customerName: users.name,
  customerEmail: users.email,
};
