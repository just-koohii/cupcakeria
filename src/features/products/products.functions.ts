import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { MAX_PRICE_CENTS } from "./constants";
import { getDb } from "@/db/client.server";
import { orderItems, products } from "@/db/schema";
import { adminMiddleware } from "@/features/auth/middleware";
import { asRecord, integerInRange, optionalString, requiredString } from "@/utils/validation";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const listProducts = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const data = input ? asRecord(input) : {};
    return {
      search: optionalString(data.search, "Busca", 100),
      category: optionalString(data.category, "Categoria", 60),
    };
  })
  .handler(async ({ data }) => {
    const filters = [eq(products.active, true)];
    if (data.search) {
      const term = `%${data.search}%`;
      filters.push(or(like(products.name, term), like(products.description, term))!);
    }
    if (data.category) {
      filters.push(eq(products.category, data.category));
    }
    return getDb()
      .select()
      .from(products)
      .where(and(...filters))
      .orderBy(asc(products.name))
      .all();
  });

export const listFeaturedProducts = createServerFn({ method: "GET" }).handler(async () =>
  getDb()
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.featured, true)))
    .orderBy(asc(products.name))
    .all(),
);

export const listCategories = createServerFn({ method: "GET" }).handler(async () =>
  getDb()
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.category))
    .all()
    .map((row) => row.category),
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((slug: unknown) => requiredString(slug, "Produto", { max: 120 }))
  .handler(async ({ data: slug }) => {
    const db = getDb();
    const product = db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.active, true)))
      .get();
    if (!product) {
      return null;
    }
    const related = db
      .select()
      .from(products)
      .where(
        and(
          eq(products.active, true),
          eq(products.category, product.category),
          sql`${products.id} != ${product.id}`,
        ),
      )
      .limit(4)
      .all();
    return { product, related };
  });

const parseProductInput = (input: unknown) => {
  const data = asRecord(input);
  const imageUrl = requiredString(data.imageUrl, "Imagem", { max: 500 });
  if (!imageUrl.startsWith("/images/") && !/^https:\/\//.test(imageUrl)) {
    throw new Error("A imagem deve ser uma foto do catálogo ou uma URL https.");
  }
  return {
    name: requiredString(data.name, "Nome", { min: 2, max: 80 }),
    description: requiredString(data.description, "Descrição", { min: 10, max: 600 }),
    category: requiredString(data.category, "Categoria", { max: 40 }),
    priceCents: integerInRange(data.priceCents, "Preço (centavos)", 1, MAX_PRICE_CENTS),
    imageUrl,
    active: data.active !== false,
    featured: data.featured === true,
  };
};

export const listAllProducts = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const db = getDb();
    const sold = db
      .select({
        productId: orderItems.productId,
        quantity: sql<number>`sum(${orderItems.quantity})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId)
      .all();
    const soldMap = new Map(sold.map((row) => [row.productId, Number(row.quantity)]));
    return db
      .select()
      .from(products)
      .orderBy(asc(products.name))
      .all()
      .map((product) => ({ ...product, unitsSold: soldMap.get(product.id) ?? 0 }));
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator(parseProductInput)
  .handler(async ({ data }) => {
    const db = getDb();
    const base = slugify(data.name) || "cupcake";
    let slug = base;
    for (let i = 2; db.select().from(products).where(eq(products.slug, slug)).get(); i++) {
      slug = `${base}-${i}`;
    }
    return db
      .insert(products)
      .values({ ...data, slug, createdAt: new Date() })
      .returning()
      .get();
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => {
    const data = asRecord(input);
    return {
      id: integerInRange(data.id, "Produto", 1, Number.MAX_SAFE_INTEGER),
      ...parseProductInput(data),
    };
  })
  .handler(async ({ data: { id, ...values } }) => {
    const updated = getDb()
      .update(products)
      .set(values)
      .where(eq(products.id, id))
      .returning()
      .get();
    if (!updated) {
      throw new Error("Produto não encontrado.");
    }
    return updated;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((id: unknown) => integerInRange(id, "Produto", 1, Number.MAX_SAFE_INTEGER))
  .handler(async ({ data: id }) => {
    const deleted = getDb().delete(products).where(eq(products.id, id)).returning().get();
    if (!deleted) {
      throw new Error("Produto não encontrado.");
    }
    return { id };
  });
