import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { CUSTOMER_CANCELLABLE } from "./constants";
import { findOrdersByUser } from "./orders.server";
import { getDb } from "@/db/client.server";
import { orders } from "@/db/schema";
import { customerMiddleware } from "@/features/auth/middleware";
import { integerInRange } from "@/utils/validation";

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([customerMiddleware])
  .handler(async ({ context }) => findOrdersByUser(context.user.id));

export const cancelMyOrder = createServerFn({ method: "POST" })
  .middleware([customerMiddleware])
  .validator((id: unknown) => integerInRange(id, "Pedido", 1, Number.MAX_SAFE_INTEGER))
  .handler(async ({ data: id, context }) => {
    const db = getDb();
    const order = db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, context.user.id)))
      .get();
    if (!order) {
      throw new Error("Pedido não encontrado.");
    }
    if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
      throw new Error("Este pedido já está em preparo e não pode mais ser cancelado.");
    }
    db.update(orders)
      .set({ status: "cancelado", updatedAt: new Date() })
      .where(eq(orders.id, id))
      .run();
    return { id };
  });
