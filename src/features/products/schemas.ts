import { MAX_PRICE_CENTS } from "./constants";
import { asText, lettersOnly, maxLength, minLength, required } from "@/utils/field-rules";
import { createErrorCollector } from "@/utils/form-errors";
import { formatCurrency, parseCurrencyToCents } from "@/utils/format";
import { asRecord } from "@/utils/validation";

export interface ProductFormValues {
  name: string;
  description: string;
  category: string;
  price: string;
  imageUrl: string;
  active: boolean;
  featured: boolean;
}

export const validateProductForm = (input: unknown) => {
  const data = asRecord(input);
  const values: ProductFormValues = {
    name: asText(data.name),
    description: asText(data.description),
    category: asText(data.category),
    price: asText(data.price),
    imageUrl: asText(data.imageUrl),
    active: data.active !== false,
    featured: data.featured === true,
  };
  const priceCents = parseCurrencyToCents(values.price);

  const { errors, add } = createErrorCollector();
  add("name", required(values.name, "Informe o nome."));
  add("name", minLength(values.name, 2, "O nome"));
  add("name", maxLength(values.name, 80, "O nome"));
  add("price", required(values.price, "Informe o preço."));
  if (values.price && !/^\d{1,4}(,\d{1,2})?$/.test(values.price)) {
    add("price", "Use o formato 12,90.");
  }
  if (values.price && (Number.isNaN(priceCents) || priceCents <= 0)) {
    add("price", "O preço deve ser maior que zero.");
  }
  if (priceCents > MAX_PRICE_CENTS) {
    add("price", `O preço máximo é ${formatCurrency(MAX_PRICE_CENTS)}.`);
  }
  add("category", required(values.category, "Informe a categoria."));
  add("category", lettersOnly(values.category, "A categoria"));
  add("category", maxLength(values.category, 40, "A categoria"));
  add("description", required(values.description, "Informe a descrição."));
  add("description", minLength(values.description, 10, "A descrição"));
  add("description", maxLength(values.description, 600, "A descrição"));
  add("imageUrl", required(values.imageUrl, "Escolha uma foto."));
  if (
    values.imageUrl &&
    !values.imageUrl.startsWith("/images/") &&
    !/^https:\/\//.test(values.imageUrl)
  ) {
    add("imageUrl", "Use uma foto do acervo ou uma URL https.");
  }

  return { values, priceCents, errors };
};
