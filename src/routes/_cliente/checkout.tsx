import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/features/checkout/components/checkout-page";

export const Route = createFileRoute("/_cliente/checkout")({
  head: () => ({ meta: [{ title: "Finalizar compra | Cupcakeria" }] }),
  component: CheckoutPage,
});
