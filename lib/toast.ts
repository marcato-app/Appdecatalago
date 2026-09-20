"use client";

// Tiny external store (useSyncExternalStore), same pattern as lib/cart.ts —
// module-level state so any client component can fire a toast (showToast)
// without needing a context provider wired through every page, and
// ToastHost (rendered once in the dashboard shell) is the only subscriber
// that actually renders anything.

export interface ToastMessage {
  id: number;
  message: string;
  isError: boolean;
}

let toasts: ToastMessage[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function showToast(message: string, isError = false): void {
  const toast: ToastMessage = { id: nextId++, message, isError };
  toasts = [...toasts, toast];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id);
    notify();
  }, 2200);
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToastsSnapshot(): ToastMessage[] {
  return toasts;
}
