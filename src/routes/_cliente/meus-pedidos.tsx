import { createFileRoute } from "@tanstack/react-router";
import { MyOrdersPage } from "@/features/orders/components/my-orders-page";
import { myOrdersQueryOptions } from "@/features/orders/queries";

export const Route = createFileRoute("/_cliente/meus-pedidos")({
  loader: ({ context }) => context.queryClient.query(myOrdersQueryOptions()),
  head: () => ({ meta: [{ title: "Meus pedidos | Cupcakeria" }] }),
  component: MyOrdersPage,
});
