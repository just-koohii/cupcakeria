import { createFileRoute } from "@tanstack/react-router";
import { SalesReportPage } from "@/features/sales-reports/components/sales-report-page";
import { salesReportQueryOptions } from "@/features/sales-reports/queries";
import { addDays, isDayKey, todayKey } from "@/utils/dates";

interface ReportSearch {
  from?: string;
  to?: string;
}

const resolveRange = (search: ReportSearch) => {
  const to = search.to ?? todayKey();
  const from = search.from && search.from <= to ? search.from : addDays(to, -29);
  return { from, to };
};

export const Route = createFileRoute("/admin/relatorios")({
  validateSearch: (search: Record<string, unknown>): ReportSearch => ({
    from: isDayKey(search.from) ? search.from : undefined,
    to: isDayKey(search.to) ? search.to : undefined,
  }),
  loaderDeps: ({ search }) => resolveRange(search),
  loader: ({ context, deps }) => context.queryClient.query(salesReportQueryOptions(deps)),
  head: () => ({ meta: [{ title: "Relatórios | Admin | Cupcakeria" }] }),
  component: SalesReportsRoute,
});

function SalesReportsRoute() {
  const range = resolveRange(Route.useSearch());
  return <SalesReportPage from={range.from} to={range.to} />;
}
