import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client.server";
import { ORDER_STATUSES, orders, users } from "@/db/schema";
import { adminMiddleware } from "@/features/auth/middleware";
import { attachItems, orderWithCustomerColumns } from "@/features/orders/orders.server";
import { asRecord, integerInRange, oneOf } from "@/utils/validation";

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => {
    const data = input ? asRecord(input) : {};
    return { status: data.status ? oneOf(data.status, ORDER_STATUSES, "Status") : null };
  })
  .handler(async ({ data }) => {
    const query = getDb()
      .select(orderWithCustomerColumns)
      .from(orders)
      .innerJoin(users, eq(users.id, orders.userId))
      .orderBy(desc(orders.createdAt))
      .$dynamic();
    const rows = data.status ? query.where(eq(orders.status, data.status)).all() : query.all();
    return attachItems(rows);
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    return {
      id: integerInRange(data.id, "Pedido", 1, Number.MAX_SAFE_INTEGER),
      status: oneOf(data.status, ORDER_STATUSES, "Status"),
    };
  })
  .handler(async ({ data }) => {
    const updated = getDb()
      .update(orders)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(orders.id, data.id))
      .returning({ id: orders.id, status: orders.status })
      .get();
    if (!updated) {
      throw new Error("Pedido não encontrado.");
    }
    return updated;
  });
