import {
  Delete02Icon,
  PencilEdit01Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductFormDialog } from "./product-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/db/schema";
import { deleteProduct } from "@/features/products/products.functions";
import { adminProductsQueryOptions } from "@/features/products/queries";
import { formatCurrency } from "@/utils/format";

function DeleteProductButton({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteProduct({ data: product.id }),
    onSuccess: async () => {
      toast.add({ title: "Produto removido", description: product.name, type: "success" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
    onError: (error) =>
      toast.add({ title: "Erro ao remover", description: error.message, type: "error" }),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remover ${product.name}`}
          />
        }
      >
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover {product.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            O produto sai do catálogo definitivamente. Pedidos antigos continuam com o nome e preço
            registrados. Para apenas ocultá-lo, edite e desmarque "Disponível na loja".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => mutation.mutate()}>
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminProductsPage() {
  const { data: products } = useSuspenseQuery(adminProductsQueryOptions());
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const openForm = (product?: Product) => {
    setEditing(product);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const term = search.trim().toLowerCase();
  const filtered = term
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term),
      )
    : products;
  const categories = [...new Set(products.map((product) => product.category))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">{products.length} cupcakes cadastrados.</p>
        </div>
        <Button type="button" onClick={() => openForm()}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
          Novo produto
        </Button>
      </div>

      <div className="relative max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Filtrar por nome ou categoria"
          aria-label="Filtrar produtos"
          className="pl-8"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Vendidos</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt=""
                      loading="lazy"
                      className="size-10 shrink-0 rounded-md object-cover"
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(product.priceCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{product.unitsSold}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.active ? (
                      <Badge variant="secondary">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Oculto</Badge>
                    )}
                    {product.featured && <Badge>Destaque</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${product.name}`}
                      onClick={() => openForm(product)}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
                    </Button>
                    <DeleteProductButton product={product} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        categories={categories}
      />
    </div>
  );
}
