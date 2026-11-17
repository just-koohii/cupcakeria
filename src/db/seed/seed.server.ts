import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "../schema";
import {
  type OrderStatus,
  orderItems,
  orders,
  type PaymentMethod,
  products,
  users,
} from "../schema";
import { SEED_PRODUCTS } from "./products";
import { hashPassword } from "@/features/auth/password.server";

export const ADMIN_EMAIL = "admin@admin";
export const ADMIN_PASSWORD = "admin";
export const DEMO_CUSTOMER_EMAIL = "cliente@cliente";
export const DEMO_CUSTOMER_PASSWORD = "cliente";

const DAY_MS = 24 * 60 * 60 * 1000;

const DEMO_CUSTOMERS = [
  { name: "Cliente Demonstração", email: DEMO_CUSTOMER_EMAIL },
  { name: "Ana Souza", email: "ana.souza@exemplo.com" },
  { name: "Bruno Lima", email: "bruno.lima@exemplo.com" },
  { name: "Carla Mendes", email: "carla.mendes@exemplo.com" },
  { name: "Diego Rocha", email: "diego.rocha@exemplo.com" },
  { name: "Elisa Martins", email: "elisa.martins@exemplo.com" },
];

const ADDRESSES = [
  "Rua das Flores, 123 - Centro, São Paulo/SP - 01001-000",
  "Av. Atlântica, 456 - Copacabana, Rio de Janeiro/RJ - 22010-000",
  "Rua da Bahia, 789 - Lourdes, Belo Horizonte/MG - 30160-011",
  "Rua XV de Novembro, 321 - Centro, Curitiba/PR - 80020-310",
  "Av. Ipiranga, 654 - Azenha, Porto Alegre/RS - 90160-093",
];

const createRandom = (seed: number) => {
  let a = seed;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const statusForAge = (ageDays: number, roll: number): OrderStatus => {
  if (roll < 0.05) {
    return "cancelado";
  }
  if (ageDays > 3) {
    return "entregue";
  }
  if (ageDays > 1) {
    return roll < 0.5 ? "saiu_para_entrega" : "entregue";
  }
  const recent: OrderStatus[] = ["pendente", "pago", "em_preparo", "saiu_para_entrega"];
  return recent[Math.floor(roll * recent.length)];
};

export const seedDatabase = (db: BetterSQLite3Database<typeof schema>, now = Date.now()) => {
  const random = createRandom(20260101);
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)];

  db.transaction((tx) => {
    tx.insert(users)
      .values({
        name: "Administrador",
        email: ADMIN_EMAIL,
        passwordHash: hashPassword(ADMIN_PASSWORD),
        role: "admin",
        createdAt: new Date(now - 90 * DAY_MS),
      })
      .run();

    const demoPasswordHash = hashPassword(DEMO_CUSTOMER_PASSWORD);
    const customerIds = DEMO_CUSTOMERS.map(
      (customer, index) =>
        tx
          .insert(users)
          .values({
            ...customer,
            passwordHash: demoPasswordHash,
            role: "customer",
            createdAt: new Date(now - (60 - index * 5) * DAY_MS),
          })
          .returning({ id: users.id })
          .get().id,
    );

    const productRows = SEED_PRODUCTS.map((product, index) =>
      tx
        .insert(products)
        .values({
          ...product,
          featured: product.featured ?? false,
          imageUrl: `/images/cupcakes/${product.slug}.jpg`,
          active: true,
          createdAt: new Date(now - (120 - index) * DAY_MS),
        })
        .returning()
        .get(),
    );

    const paymentMethods: PaymentMethod[] = ["pix", "pix", "cartao", "cartao", "dinheiro"];

    for (let i = 0; i < 90; i++) {
      const ageDays = random() * 45;
      const createdAt = now - ageDays * DAY_MS;
      const itemCount = 1 + Math.floor(random() * 3);
      const chosen = new Map<number, { product: (typeof productRows)[number]; quantity: number }>();
      for (let j = 0; j < itemCount; j++) {
        const product = pick(productRows);
        const current = chosen.get(product.id);
        const quantity = 1 + Math.floor(random() * 4);
        chosen.set(product.id, { product, quantity: (current?.quantity ?? 0) + quantity });
      }
      const items = [...chosen.values()];
      const totalCents = items.reduce(
        (sum, item) => sum + item.product.priceCents * item.quantity,
        0,
      );
      const customerIndex = Math.floor(random() * customerIds.length);
      const status = statusForAge(ageDays, random());

      const order = tx
        .insert(orders)
        .values({
          userId: customerIds[customerIndex],
          status,
          paymentMethod: pick(paymentMethods),
          totalCents,
          deliveryAddress: pick(ADDRESSES),
          notes: null,
          createdAt: new Date(createdAt),
          updatedAt: new Date(Math.min(now, createdAt + random() * DAY_MS)),
        })
        .returning({ id: orders.id })
        .get();

      tx.insert(orderItems)
        .values(
          items.map((item) => ({
            orderId: order.id,
            productId: item.product.id,
            productName: item.product.name,
            unitPriceCents: item.product.priceCents,
            quantity: item.quantity,
          })),
        )
        .run();
    }
  });
};
