"use client";

import { useSyncExternalStore } from "react";
import { getToastsSnapshot, subscribeToasts } from "@/lib/toast";

function getServerSnapshot() {
  return [];
}

// Rendered once in the dashboard shell layout — every showToast() call
// anywhere in the dashboard shows up here, bottom-center, auto-dismissing.
export function ToastHost() {
  const toasts = useSyncExternalStore(subscribeToasts, getToastsSnapshot, getServerSnapshot);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg ${
            toast.isError ? "bg-red-600 text-white" : "bg-violet-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
