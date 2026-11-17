import { queryOptions } from "@tanstack/react-query";
import { getSalesReport } from "./sales-reports.functions";

export const salesReportQueryOptions = (range: { from: string; to: string }) =>
  queryOptions({
    queryKey: ["admin", "sales-report", range.from, range.to],
    queryFn: () => getSalesReport({ data: range }),
  });
