import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/db/schema";
import { CATALOG_IMAGES, DEFAULT_CATEGORIES, MAX_PRICE_CENTS } from "@/features/products/constants";
import { createProduct, updateProduct } from "@/features/products/products.functions";
import { cn } from "@/utils/cn";
import { centsToInput, formatCurrency, parseCurrencyToCents } from "@/utils/format";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories: string[];
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
}: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? CATALOG_IMAGES[0].url);
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (values: Omit<Product, "id" | "slug" | "createdAt">) =>
      product
        ? updateProduct({ data: { ...values, id: product.id } })
        : createProduct({ data: values }),
    onSuccess: async (saved) => {
      toast.add({
        title: product ? "Produto atualizado" : "Produto criado",
        description: saved.name,
        type: "success",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
      onOpenChange(false);
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const priceCents = parseCurrencyToCents(String(form.get("price") ?? ""));
    if (Number.isNaN(priceCents) || priceCents <= 0 || priceCents > MAX_PRICE_CENTS) {
      setLocalError(`Informe um preço entre R$ 0,01 e ${formatCurrency(MAX_PRICE_CENTS)}.`);
      return;
    }
    setLocalError(null);
    mutation.mutate({
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      category: String(form.get("category") ?? ""),
      priceCents,
      imageUrl,
      active,
      featured,
    });
  };

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort();
  const error = localError ?? mutation.error?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? `Editar ${product.name}` : "Novo cupcake"}</DialogTitle>
          <DialogDescription>
            Preço máximo de {formatCurrency(MAX_PRICE_CENTS)} por unidade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="product-name">Nome</FieldLabel>
                <Input
                  id="product-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={product?.name}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="product-price">Preço (R$)</FieldLabel>
                <Input
                  id="product-price"
                  name="price"
                  required
                  inputMode="decimal"
                  placeholder="12,90"
                  defaultValue={product ? centsToInput(product.priceCents) : ""}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="product-category">Categoria</FieldLabel>
              <Input
                id="product-category"
                name="category"
                required
                list="product-categories"
                defaultValue={product?.category}
              />
              <datalist id="product-categories">
                {allCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </Field>
            <Field>
              <FieldLabel htmlFor="product-description">Descrição</FieldLabel>
              <Textarea
                id="product-description"
                name="description"
                required
                minLength={10}
                maxLength={600}
                rows={3}
                defaultValue={product?.description}
              />
            </Field>

            <FieldSet>
              <FieldLegend variant="label">Foto</FieldLegend>
              <FieldDescription>
                Escolha uma foto real do nosso acervo ou informe uma URL https.
              </FieldDescription>
              <ScrollArea className="h-48 rounded-lg border">
                <div className="grid grid-cols-4 gap-2 p-2 sm:grid-cols-6">
                  {CATALOG_IMAGES.map((image) => (
                    <button
                      key={image.url}
                      type="button"
                      title={image.label}
                      aria-label={`Usar foto ${image.label}`}
                      aria-pressed={imageUrl === image.url}
                      onClick={() => setImageUrl(image.url)}
                      className={cn(
                        "aspect-square overflow-hidden rounded-md border-2 border-transparent",
                        imageUrl === image.url && "border-primary ring-2 ring-primary/30",
                      )}
                    >
                      <img
                        src={image.url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <Input
                aria-label="URL da foto"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />
            </FieldSet>

            <div className="flex flex-wrap gap-6">
              <Label className="flex items-center gap-2">
                <Switch checked={active} onCheckedChange={setActive} />
                Disponível na loja
              </Label>
              <Label className="flex items-center gap-2">
                <Switch checked={featured} onCheckedChange={setFeatured} />
                Destaque na home
              </Label>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              {product ? "Salvar alterações" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
