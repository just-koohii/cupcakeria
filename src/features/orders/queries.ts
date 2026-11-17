import { queryOptions } from "@tanstack/react-query";
import { listMyOrders } from "./orders.functions";

export const myOrdersQueryOptions = () =>
  queryOptions({
    queryKey: ["orders", "mine"],
    queryFn: () => listMyOrders(),
  });
