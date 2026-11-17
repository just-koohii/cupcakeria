import { queryOptions } from "@tanstack/react-query";
import { getDashboard } from "./admin-dashboard.functions";

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "dashboard"],
    queryFn: () => getDashboard(),
  });
