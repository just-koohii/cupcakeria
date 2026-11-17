import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray } from "drizzle-orm";
import { validateCheckoutForm } from "./schemas";
import { getDb } from "@/db/client.server";
import { orderItems, orders, products } from "@/db/schema";
import { customerMiddleware } from "@/features/auth/middleware";
import { MAX_ITEM_QUANTITY } from "@/features/cart/cart-store";
import { assertNoFieldErrors } from "@/utils/form-errors";
import { asRecord, integerInRange, ValidationError } from "@/utils/validation";

const parseCheckoutInput = (input: unknown) => {
  const data = asRecord(input);
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new ValidationError("Seu carrinho está vazio.");
  }
  const items = data.items.map((raw) => {
    const item = asRecord(raw);
    return {
      productId: integerInRange(item.productId, "Produto", 1, Number.MAX_SAFE_INTEGER),
      quantity: integerInRange(item.quantity, "Quantidade", 1, MAX_ITEM_QUANTITY),
    };
  });
  const { values, errors } = validateCheckoutForm(data);
  assertNoFieldErrors(errors);
  return {
    items,
    paymentMethod: values.paymentMethod,
    cardLast4: values.paymentMethod === "cartao" ? values.cardNumber.slice(-4) : null,
    notes: values.notes || null,
    address: {
      street: values.street,
      number: values.number,
      complement: values.complement || null,
      district: values.district,
      city: values.city,
      state: values.state,
      zip: values.zip,
    },
  };
};

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([customerMiddleware])
  .validator(parseCheckoutInput)
  .handler(async ({ data, context }) => {
    const db = getDb();
    const ids = [...new Set(data.items.map((item) => item.productId))];
    const available = db
      .select()
      .from(products)
      .where(and(inArray(products.id, ids), eq(products.active, true)))
      .all();
    const byId = new Map(available.map((product) => [product.id, product]));

    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length > 0) {
      throw new Error(
        "Alguns produtos do carrinho não estão mais disponíveis. Atualize o carrinho e tente novamente.",
      );
    }

    const merged = new Map<number, number>();
    for (const item of data.items) {
      merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
    }
    const lines = [...merged.entries()].map(([productId, quantity]) => {
      const product = byId.get(productId)!;
      return {
        productId,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity,
      };
    });
    const totalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);

    const { street, number, complement, district, city, state, zip } = data.address;
    const deliveryAddress = `${street}, ${number}${complement ? ` (${complement})` : ""} - ${district}, ${city}/${state} - ${zip}`;
    const paymentNote = data.cardLast4 ? `Cartão final ${data.cardLast4}` : null;
    const notes = [data.notes, paymentNote].filter(Boolean).join(" · ") || null;
    const now = new Date();

    const order = db.transaction((tx) => {
      const created = tx
        .insert(orders)
        .values({
          userId: context.user.id,
          status: data.paymentMethod === "dinheiro" ? "pendente" : "pago",
          paymentMethod: data.paymentMethod,
          totalCents,
          deliveryAddress,
          notes,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      tx.insert(orderItems)
        .values(lines.map((line) => ({ ...line, orderId: created.id })))
        .run();
      return created;
    });

    return { id: order.id, status: order.status, totalCents: order.totalCents };
  });
