"use client";

import { formatCentsToBRL } from "@/lib/money";

export function CartBar({
  totalCount,
  totalCents,
  onOpen,
}: {
  totalCount: number;
  totalCents: number;
  onOpen: () => void;
}) {
  if (totalCount === 0) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-left font-semibold text-white shadow-lg"
        style={{ background: "var(--color-primary)" }}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-sm">{totalCount}</span>
        <span className="flex-1">Ver pedido</span>
        <span>{formatCentsToBRL(totalCents)}</span>
      </button>
    </div>
  );
}
