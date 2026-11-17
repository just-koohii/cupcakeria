import { SEED_PRODUCTS } from "@/db/seed/products";

export const MAX_PRICE_CENTS = 2000;

export const CATALOG_IMAGES = SEED_PRODUCTS.map((product) => ({
  url: `/images/cupcakes/${product.slug}.jpg`,
  label: product.name,
}));

export const DEFAULT_CATEGORIES = ["Clássicos", "Chocolate", "Frutados", "Especiais", "Temáticos"];
