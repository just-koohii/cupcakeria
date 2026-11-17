import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/db/schema";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { formatCurrency } from "@/utils/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden pt-0">
      <Link
        to="/produtos/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.imageUrl}
          alt={`Cupcake ${product.name}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge variant="secondary" className="absolute top-3 left-3 shadow-sm">
          {product.category}
        </Badge>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-1">
        <Link
          to="/produtos/$slug"
          params={{ slug: product.slug }}
          className="font-heading text-base font-semibold text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <span className="text-lg font-semibold">{formatCurrency(product.priceCents)}</span>
        <AddToCartButton product={product} size="sm" />
      </CardFooter>
    </Card>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
