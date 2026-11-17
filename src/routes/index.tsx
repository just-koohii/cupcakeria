import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/home/components/home-page";
import { featuredProductsQueryOptions } from "@/features/products/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.query(featuredProductsQueryOptions()),
  component: HomePage,
});
