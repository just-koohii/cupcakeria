import { queryOptions } from "@tanstack/react-query";
import { listAllOrders } from "./admin-orders.functions";
import type { OrderStatus } from "@/db/enums";

export const adminOrdersQueryOptions = (status?: OrderStatus) =>
  queryOptions({
    queryKey: ["admin", "orders", status ?? "all"],
    queryFn: () => listAllOrders({ data: { status } }),
  });
