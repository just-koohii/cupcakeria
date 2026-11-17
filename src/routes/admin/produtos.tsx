import { createFileRoute } from "@tanstack/react-router";
import { AdminProductsPage } from "@/features/admin-products/components/admin-products-page";
import { adminProductsQueryOptions } from "@/features/products/queries";

export const Route = createFileRoute("/admin/produtos")({
  loader: ({ context }) => context.queryClient.query(adminProductsQueryOptions()),
  head: () => ({ meta: [{ title: "Produtos | Admin | Cupcakeria" }] }),
  component: AdminProductsPage,
});
