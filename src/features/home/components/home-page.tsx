import {
  ArrowRight01Icon,
  CakeIcon,
  DeliveryTruck01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductGrid } from "@/features/products/components/product-card";
import { featuredProductsQueryOptions } from "@/features/products/queries";

const STEPS = [
  {
    icon: CakeIcon,
    title: "Escolha seus sabores",
    text: "Mais de 30 cupcakes artesanais, todos por até R$ 20,00.",
  },
  {
    icon: ShoppingBag01Icon,
    title: "Finalize o pedido",
    text: "Pague com Pix, cartão ou dinheiro na entrega.",
  },
  {
    icon: DeliveryTruck01Icon,
    title: "Receba fresquinho",
    text: "Acompanhe o status do pedido até chegar na sua porta.",
  },
];

export function HomePage() {
  const { data: featured } = useSuspenseQuery(featuredProductsQueryOptions());
  const heroImages = featured.slice(0, 4);

  return (
    <div className="flex flex-col gap-16">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            Confeitaria artesanal
          </span>
          <h1 className="display-title text-4xl leading-tight font-bold sm:text-5xl">
            Cupcakes feitos à mão, entregues com carinho.
          </h1>
          <p className="max-w-prose text-lg text-muted-foreground">
            Do clássico red velvet ao pistache, cada cupcake é assado no dia. Escolha, peça e
            acompanhe tudo pelo site.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/produtos" className={buttonVariants({ size: "lg" })}>
              Ver cardápio
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
            </Link>
            <Link to="/cadastro" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Criar conta
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {heroImages.map((product, index) => (
            <Link
              key={product.id}
              to="/produtos/$slug"
              params={{ slug: product.slug }}
              className={`overflow-hidden rounded-2xl bg-muted shadow-sm ${index % 2 === 1 ? "translate-y-6" : ""}`}
            >
              <img
                src={product.imageUrl}
                alt={`Cupcake ${product.name}`}
                className="aspect-square size-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.title} size="sm">
            <CardContent className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon icon={step.icon} strokeWidth={2} className="size-5" />
              </span>
              <div>
                <h2 className="font-heading font-semibold">{step.title}</h2>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">Mais pedidos</h2>
            <p className="text-muted-foreground">Os favoritos da nossa clientela.</p>
          </div>
          <Link to="/produtos" className={buttonVariants({ variant: "ghost" })}>
            Ver todos
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
