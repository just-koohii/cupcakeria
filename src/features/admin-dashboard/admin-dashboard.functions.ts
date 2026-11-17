import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq } from "drizzle-orm";
import { getDb, getDbInfo } from "@/db/client.server";
import { ORDER_STATUSES, type OrderStatus, orders, products, users } from "@/db/schema";
import { adminMiddleware } from "@/features/auth/middleware";
import { orderWithCustomerColumns } from "@/features/orders/orders.server";
import { buildSalesReport } from "@/features/sales-reports/sales.server";
import { addDays, todayKey } from "@/utils/dates";

const OPEN_STATUSES: OrderStatus[] = ["pendente", "pago", "em_preparo", "saiu_para_entrega"];

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const db = getDb();
    const today = todayKey();

    const allTime = buildSalesReport("2000-01-01", today);
    const lastDays = buildSalesReport(addDays(today, -13), today);

    const statusRows = db
      .select({ status: orders.status, total: count() })
      .from(orders)
      .groupBy(orders.status)
      .all();
    const statusCounts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
      OrderStatus,
      number
    >;
    for (const row of statusRows) {
      statusCounts[row.status] = row.total;
    }

    const recentOrders = db
      .select(orderWithCustomerColumns)
      .from(orders)
      .innerJoin(users, eq(users.id, orders.userId))
      .orderBy(desc(orders.createdAt))
      .limit(6)
      .all();

    const customers =
      db.select({ total: count() }).from(users).where(eq(users.role, "customer")).get()?.total ?? 0;
    const activeProducts =
      db.select({ total: count() }).from(products).where(eq(products.active, true)).get()?.total ??
      0;

    return {
      totals: {
        orders: allTime.summary.orders,
        revenueCents: allTime.summary.revenueCents,
        averageTicketCents: allTime.summary.averageTicketCents,
        itemsSold: allTime.summary.itemsSold,
        openOrders: OPEN_STATUSES.reduce((sum, status) => sum + statusCounts[status], 0),
        customers,
        activeProducts,
      },
      revenueByDay: lastDays.byDay,
      topProducts: allTime.byProduct.slice(0, 5),
      statusCounts,
      recentOrders,
      nextResetAt: getDbInfo().nextResetAt,
    };
  });
