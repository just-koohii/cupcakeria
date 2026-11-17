import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { FormField, FormTextareaField } from "@/components/form-field";
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
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import type { Product } from "@/db/schema";
import { CATALOG_IMAGES, DEFAULT_CATEGORIES, MAX_PRICE_CENTS } from "@/features/products/constants";
import { createProduct, updateProduct } from "@/features/products/products.functions";
import { type ProductFormValues, validateProductForm } from "@/features/products/schemas";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { cn } from "@/utils/cn";
import { getFieldErrors, getFormErrorMessage, hasFieldErrors } from "@/utils/form-errors";
import { centsToInput, formatCurrency } from "@/utils/format";
import { currencyMask, lettersMask } from "@/utils/input-masks";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories: string[];
}

export const ProductFormDialog = ({
  open,
  onOpenChange,
  product,
  categories,
}: ProductFormDialogProps) => {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? CATALOG_IMAGES[0].url);
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const { errors, setErrors, clearError } = useFieldErrors();

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
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
    onError: (error) => setErrors(getFieldErrors(error)),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors: found } = validateProductForm({
      ...Object.fromEntries(new FormData(event.currentTarget)),
      imageUrl,
      active,
      featured,
    });
    setErrors(found);
    if (hasFieldErrors(found)) {
      return;
    }
    mutation.mutate(values);
  };

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort();
  const formError = getFormErrorMessage(mutation.error);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? `Editar ${product.name}` : "Novo cupcake"}</DialogTitle>
          <DialogDescription>
            Preço máximo de {formatCurrency(MAX_PRICE_CENTS)} por unidade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="product-name"
                name="name"
                label="Nome"
                maxLength={80}
                defaultValue={product?.name}
                error={errors.name}
                onFieldChange={clearError}
              />
              <FormField
                id="product-price"
                name="price"
                label="Preço (R$)"
                inputMode="decimal"
                placeholder="12,90"
                defaultValue={product ? centsToInput(product.priceCents) : ""}
                mask={currencyMask}
                error={errors.price}
                onFieldChange={clearError}
              />
            </div>
            <FormField
              id="product-category"
              name="category"
              label="Categoria"
              list="product-categories"
              maxLength={40}
              defaultValue={product?.category}
              mask={lettersMask}
              error={errors.category}
              onFieldChange={clearError}
            />
            <datalist id="product-categories">
              {allCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <FormTextareaField
              id="product-description"
              name="description"
              label="Descrição"
              maxLength={600}
              rows={3}
              defaultValue={product?.description}
              error={errors.description}
              onFieldChange={clearError}
            />

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
                      onClick={() => {
                        setImageUrl(image.url);
                        clearError("imageUrl");
                      }}
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
              <FormField
                id="product-imageUrl"
                name="imageUrl"
                label="URL da foto"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                error={errors.imageUrl}
                onFieldChange={clearError}
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
};
