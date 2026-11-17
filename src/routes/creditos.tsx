import { createFileRoute } from "@tanstack/react-router";
import { ImageCreditsPage } from "@/features/layout/components/image-credits-page";

export const Route = createFileRoute("/creditos")({
  head: () => ({ meta: [{ title: "Créditos das fotos | Cupcakeria" }] }),
  component: ImageCreditsPage,
});
