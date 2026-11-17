import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductDetails } from "@/features/products/components/product-details";
import { productDetailsQueryOptions } from "@/features/products/queries";

export const Route = createFileRoute("/produtos/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.query(productDetailsQueryOptions(params.slug));
    if (!data) {
      throw notFound();
    }
    return { title: data.product.name };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Cupcake"} | Cupcakeria` }],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  const { slug } = Route.useParams();
  return <ProductDetails slug={slug} />;
}
