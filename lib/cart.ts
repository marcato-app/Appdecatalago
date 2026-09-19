"use client";

import { useCallback, useSyncExternalStore } from "react";

// Client-side cart, ported from
// references/modelos/adega-mm/assets/js/script.js. Namespaced per store
// (cart:${storeId}) — the original used a single fixed key because it was a
// single-store static site; here many stores share the same browser, so a
// fixed key would leak one store's cart into another's checkout message.
//
// Implemented as a tiny external store (useSyncExternalStore) rather than
// useState+useEffect: localStorage isn't available during SSR, and
// useSyncExternalStore's getServerSnapshot is the sanctioned way to render
// an empty cart server-side and pick up the real one on the client without
// a hydration mismatch or a synchronous setState-in-effect.

export interface CartItem {
  name: string;
  unitLabel: string | null;
  priceCents: number;
  qty: number;
}

type CartState = Record<string, CartItem>;

const EMPTY_CART: CartState = {};
const cache = new Map<string, CartState>();
const listeners = new Map<string, Set<() => void>>();

function storageKey(storeId: string): string {
  return `cart:${storeId}`;
}

function readFromStorage(storeId: string): CartState {
  try {
    const raw = window.localStorage.getItem(storageKey(storeId));
    return raw ? (JSON.parse(raw) as CartState) : {};
  } catch {
    return {};
  }
}

function getSnapshot(storeId: string): CartState {
  if (!cache.has(storeId)) {
    cache.set(storeId, readFromStorage(storeId));
  }
  return cache.get(storeId)!;
}

function getServerSnapshot(): CartState {
  return EMPTY_CART;
}

function setSnapshot(storeId: string, next: CartState): void {
  cache.set(storeId, next);
  try {
    window.localStorage.setItem(storageKey(storeId), JSON.stringify(next));
  } catch {
    // private browsing / storage disabled — cart just won't persist
  }
  listeners.get(storeId)?.forEach((listener) => listener());
}

function subscribe(storeId: string, callback: () => void): () => void {
  if (!listeners.has(storeId)) listeners.set(storeId, new Set());
  listeners.get(storeId)!.add(callback);
  return () => listeners.get(storeId)?.delete(callback);
}

export function useCart(storeId: string) {
  const cart = useSyncExternalStore(
    (callback) => subscribe(storeId, callback),
    () => getSnapshot(storeId),
    getServerSnapshot,
  );

  const setQty = useCallback(
    (productId: string, qty: number, meta: { name: string; unitLabel: string | null; priceCents: number }) => {
      const current = getSnapshot(storeId);
      const next = { ...current };
      if (qty <= 0) {
        delete next[productId];
      } else {
        next[productId] = { name: meta.name, unitLabel: meta.unitLabel, priceCents: meta.priceCents, qty };
      }
      setSnapshot(storeId, next);
    },
    [storeId],
  );

  const clear = useCallback(() => setSnapshot(storeId, {}), [storeId]);

  const entries = Object.entries(cart).map(([productId, item]) => ({ productId, ...item }));
  const totalCount = entries.reduce((sum, item) => sum + item.qty, 0);
  const totalCents = entries.reduce((sum, item) => sum + item.qty * item.priceCents, 0);

  return { entries, totalCount, totalCents, setQty, clear };
}
