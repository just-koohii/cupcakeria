import { createFileRoute } from "@tanstack/react-router";
import { ORDER_STATUSES, type OrderStatus } from "@/db/enums";
import { AdminOrdersPage } from "@/features/admin-orders/components/admin-orders-page";
import { adminOrdersQueryOptions } from "@/features/admin-orders/queries";

export const Route = createFileRoute("/admin/pedidos")({
  validateSearch: (search: Record<string, unknown>): { status?: OrderStatus } => ({
    status: ORDER_STATUSES.includes(search.status as OrderStatus)
      ? (search.status as OrderStatus)
      : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.query(adminOrdersQueryOptions(deps.status)),
  head: () => ({ meta: [{ title: "Pedidos | Admin | Cupcakeria" }] }),
  component: AdminOrdersRoute,
});

function AdminOrdersRoute() {
  const { status } = Route.useSearch();
  return <AdminOrdersPage status={status} />;
}
