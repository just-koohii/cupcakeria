import { createFileRoute } from "@tanstack/react-router";
import { ProductCatalog } from "@/features/products/components/product-catalog";
import {
  categoriesQueryOptions,
  type ProductFilters,
  productsQueryOptions,
} from "@/features/products/queries";

export const Route = createFileRoute("/produtos/")({
  validateSearch: (search: Record<string, unknown>): ProductFilters => ({
    search: typeof search.search === "string" && search.search ? search.search : undefined,
    category: typeof search.category === "string" && search.category ? search.category : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.query(productsQueryOptions(deps)),
      context.queryClient.query(categoriesQueryOptions()),
    ]),
  head: () => ({ meta: [{ title: "Cupcakes | Cupcakeria" }] }),
  component: ProductsRoute,
});

function ProductsRoute() {
  const filters = Route.useSearch();
  return <ProductCatalog filters={filters} />;
}
