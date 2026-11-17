import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { cartActions } from "../cart-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/db/schema";
import { useCurrentUser } from "@/features/auth/queries";

interface AddToCartButtonProps {
  product: Pick<Product, "id" | "slug" | "name" | "priceCents" | "imageUrl">;
  quantity?: number;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  size = "default",
  className,
}: AddToCartButtonProps) {
  const user = useCurrentUser();
  const location = useLocation();

  if (user?.role === "admin") {
    return null;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        search={{ redirect: location.href }}
        className={buttonVariants({ variant: "outline", size, className })}
      >
        Entrar para comprar
      </Link>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      className={className}
      onClick={() => {
        cartActions.add(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceCents: product.priceCents,
            imageUrl: product.imageUrl,
          },
          quantity,
        );
        toast.add({
          title: "Adicionado ao carrinho",
          description: `${quantity}× ${product.name}`,
          type: "success",
        });
      }}
    >
      <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} data-icon="inline-start" />
      Adicionar
    </Button>
  );
}
