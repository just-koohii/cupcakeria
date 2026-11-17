import { useSyncExternalStore } from "react";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
}

export const MAX_ITEM_QUANTITY = 50;
const STORAGE_KEY = "cupcake-cart";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const load = () => {
  if (loaded || typeof window === "undefined") {
    return;
  }
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    items = [];
  }
};

const commit = (next: CartItem[]) => {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // biome-ignore lint/suspicious/noEmptyBlockStatements: ignore
  } catch {}
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      loaded = false;
      load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

const getSnapshot = () => {
  load();
  return items;
};

const clamp = (quantity: number) => Math.max(0, Math.min(MAX_ITEM_QUANTITY, Math.floor(quantity)));

export const cartActions = {
  add(product: Omit<CartItem, "quantity">, quantity = 1) {
    load();
    const existing = items.find((item) => item.productId === product.productId);
    if (existing) {
      cartActions.setQuantity(product.productId, existing.quantity + quantity);
      return;
    }
    commit([...items, { ...product, quantity: clamp(quantity) }]);
  },
  setQuantity(productId: number, quantity: number) {
    load();
    const next = clamp(quantity);
    commit(
      next === 0
        ? items.filter((item) => item.productId !== productId)
        : items.map((item) => (item.productId === productId ? { ...item, quantity: next } : item)),
    );
  },
  remove(productId: number) {
    load();
    commit(items.filter((item) => item.productId !== productId));
  },
  clear() {
    commit([]);
  },
};

export const useCart = () => {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const totalCents = cartItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { items: cartItems, totalCents, count };
};
