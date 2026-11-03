"use client";

/**
 * سلة التسوق — تُحفظ في المتصفح وتُرسل الطلب كاملاً عبر واتساب
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/data/products";
import { readStore, writeStore } from "./storage";

export interface CartItem {
  slug: string;
  sizeId: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (slug: string, sizeId: string, qty?: number) => void;
  setQty: (slug: string, sizeId: string, qty: number) => void;
  remove: (slug: string, sizeId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "abn-cart";

export function priceOf(item: CartItem) {
  const product = getProduct(item.slug);
  const size = product?.sizes.find((s) => s.id === item.sizeId);
  return size ? size.price * item.qty : 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // نتجاهل أي منتج محذوف من products.ts
    setItems(readStore<CartItem[]>(STORAGE_KEY, []).filter((i) => getProduct(i.slug)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStore(STORAGE_KEY, items);
  }, [items, ready]);

  const add = useCallback((slug: string, sizeId: string, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === slug && i.sizeId === sizeId);
      if (found) return prev.map((i) => (i === found ? { ...i, qty: Math.min(i.qty + qty, 99) } : i));
      return [...prev, { slug, sizeId, qty }];
    });
  }, []);

  const setQty = useCallback((slug: string, sizeId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.slug === slug && i.sizeId === sizeId))
        : prev.map((i) => (i.slug === slug && i.sizeId === sizeId ? { ...i, qty: Math.min(qty, 99) } : i))
    );
  }, []);

  const remove = useCallback((slug: string, sizeId: string) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.sizeId === sizeId)));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + priceOf(i), 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
      clear: () => setItems([]),
    }),
    [items, isOpen, add, setQty, remove]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
