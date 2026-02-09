"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string; // unique line id for cart operations
  itemId: string; // product id
  name_ar: string;
  priceInt: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "id">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const CART_KEY = "qr_menu_cart";

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(CART_KEY);
    if (!s) return [];
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/** Round to 1 decimal to avoid floating point errors (e.g. 1.5 kg) */
function roundQty(n: number): number {
  return Math.round(n * 10) / 10;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity" | "id">, quantity = 1) => {
    setItems((prev) => {
      const normNotes = (v: string | undefined) => (v ?? "").trim();
      const itemNotes = normNotes(item.notes);
      const matching = prev.filter(
        (i) => i.itemId === item.itemId && normNotes(i.notes) === itemNotes
      );
      if (matching.length > 0) {
        const totalQty = roundQty(matching.reduce((s, i) => s + i.quantity, 0) + quantity);
        const merged: CartItem = { ...matching[0], quantity: totalQty };
        return [
          ...prev.filter((i) => !(i.itemId === item.itemId && normNotes(i.notes) === itemNotes)),
          merged,
        ];
      }
      const lineId = crypto.randomUUID();
      return [...prev, { ...item, id: lineId, quantity: roundQty(quantity) }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    const q = roundQty(quantity);
    if (q <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== lineId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === lineId ? { ...i, quantity: q } : i))
    );
  }, []);

  const updateNotes = useCallback((lineId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === lineId ? { ...i, notes } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.priceInt * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
