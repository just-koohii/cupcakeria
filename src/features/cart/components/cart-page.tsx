import {
  Delete02Icon,
  MinusSignIcon,
  PlusSignIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { cartActions, MAX_ITEM_QUANTITY, useCart } from "../cart-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/format";

export function CartPage() {
  const { items, totalCents, count } = useCart();

  if (items.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Seu carrinho está vazio</EmptyTitle>
          <EmptyDescription>Que tal escolher alguns cupcakes?</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to="/produtos" className={buttonVariants()}>
            Ver cardápio
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Carrinho</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="flex flex-col divide-y">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <Link
                  to="/produtos/$slug"
                  params={{ slug: item.slug }}
                  className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      to="/produtos/$slug"
                      params={{ slug: item.slug }}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.priceCents)} cada
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center rounded-lg border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Diminuir quantidade de ${item.name}`}
                        onClick={() => cartActions.setQuantity(item.productId, item.quantity - 1)}
                      >
                        <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        disabled={item.quantity >= MAX_ITEM_QUANTITY}
                        onClick={() => cartActions.setQuantity(item.productId, item.quantity + 1)}
                      >
                        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                      </Button>
                    </div>
                    <span className="w-20 text-right font-semibold tabular-nums">
                      {formatCurrency(item.priceCents * item.quantity)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remover ${item.name}`}
                      onClick={() => cartActions.remove(item.productId)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Itens</span>
              <span>{count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrega</span>
              <span>Grátis</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totalCents)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link to="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })}>
              Finalizar compra
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => cartActions.clear()}
            >
              Esvaziar carrinho
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
