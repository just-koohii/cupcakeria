import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { categoriesQueryOptions, type ProductFilters, productsQueryOptions } from "../queries";
import { ProductGrid } from "./product-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";

export function ProductCatalog({ filters }: { filters: ProductFilters }) {
  const navigate = useNavigate({ from: "/produtos/" });
  const { data: products } = useSuspenseQuery(productsQueryOptions(filters));
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const setFilters = (next: ProductFilters) =>
    navigate({ search: { ...filters, ...next }, replace: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Nossos cupcakes</h1>
        <p className="text-muted-foreground">
          Feitos diariamente, com ingredientes frescos. Todos até R$ 20,00.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const value = String(new FormData(event.currentTarget).get("search") ?? "").trim();
            setFilters({ search: value || undefined });
          }}
        >
          <Input
            key={filters.search ?? ""}
            name="search"
            type="search"
            placeholder="Buscar por sabor, ingrediente…"
            defaultValue={filters.search ?? ""}
            className="max-w-md"
            aria-label="Buscar cupcakes"
          />
          <Button type="submit" variant="secondary">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} data-icon="inline-start" />
            Buscar
          </Button>
        </form>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          <Button
            type="button"
            size="sm"
            variant={filters.category ? "outline" : "default"}
            onClick={() => setFilters({ category: undefined })}
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              size="sm"
              variant={filters.category === category ? "default" : "outline"}
              onClick={() => setFilters({ category })}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Nenhum cupcake encontrado</EmptyTitle>
            <EmptyDescription>Tente outra busca ou remova os filtros.</EmptyDescription>
          </EmptyHeader>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ search: {}, replace: true })}
          >
            Limpar filtros
          </Button>
        </Empty>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </p>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  );
}
