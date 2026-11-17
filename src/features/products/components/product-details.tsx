import { ArrowLeft01Icon, MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { productDetailsQueryOptions } from "../queries";
import { ProductGrid } from "./product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/features/auth/queries";
import { MAX_ITEM_QUANTITY } from "@/features/cart/cart-store";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { formatCurrency } from "@/utils/format";

export function ProductDetails({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(productDetailsQueryOptions(slug));
  const user = useCurrentUser();
  const [quantity, setQuantity] = useState(1);

  if (!data) {
    return null;
  }
  const { product, related } = data;

  return (
    <div className="flex flex-col gap-10">
      <Link
        to="/produtos"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        Voltar para o catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-muted">
          <img
            src={product.imageUrl}
            alt={`Cupcake ${product.name}`}
            className="aspect-square size-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-3xl font-semibold text-primary">
              {formatCurrency(product.priceCents)}
            </p>
          </div>
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          <Separator />
          {user?.role !== "admin" && (
            <div className="flex flex-wrap items-center gap-3">
              {user && (
                <div className="flex items-center rounded-lg border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Diminuir quantidade"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  >
                    <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
                  </Button>
                  <span className="w-10 text-center font-medium tabular-nums" aria-live="polite">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Aumentar quantidade"
                    disabled={quantity >= MAX_ITEM_QUANTITY}
                    onClick={() => setQuantity((value) => Math.min(MAX_ITEM_QUANTITY, value + 1))}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  </Button>
                </div>
              )}
              <AddToCartButton product={product} quantity={quantity} size="lg" />
            </div>
          )}
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>• Produzido no dia da entrega</li>
            <li>• Conservar em local fresco; consumir em até 2 dias</li>
            <li>• Pode conter traços de leite, ovos, glúten e oleaginosas</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold">Você também pode gostar</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
