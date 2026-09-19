"use client";

import { formatCentsToBRL } from "@/lib/money";
import type { CardapioProduct } from "./types";

export function ProductRow({
  product,
  qty,
  onQtyChange,
}: {
  product: CardapioProduct;
  qty: number;
  onQtyChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] py-3 last:border-none">
      <div className="min-w-0">
        <p className="font-medium">
          {product.name} {product.unitLabel ? <span className="text-sm text-[var(--color-text-dim)]">{product.unitLabel}</span> : null}
        </p>
        {product.description ? <p className="text-sm text-[var(--color-text-dim)]">{product.description}</p> : null}
        <p className="mt-0.5 font-semibold" style={{ color: "var(--color-primary)" }}>
          {formatCentsToBRL(product.priceCents)}
        </p>
      </div>

      {qty === 0 ? (
        <button
          type="button"
          onClick={() => onQtyChange(1)}
          aria-label={`Adicionar ${product.name}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          +
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-line)] px-2 py-1">
          <button
            type="button"
            onClick={() => onQtyChange(qty - 1)}
            aria-label="Diminuir quantidade"
            className="flex h-6 w-6 items-center justify-center rounded-full text-white"
            style={{ background: "var(--color-primary)" }}
          >
            −
          </button>
          <span className="min-w-4 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => onQtyChange(qty + 1)}
            aria-label="Aumentar quantidade"
            className="flex h-6 w-6 items-center justify-center rounded-full text-white"
            style={{ background: "var(--color-primary)" }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
