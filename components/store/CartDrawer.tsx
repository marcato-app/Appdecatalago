"use client";

import { formatCentsToBRL } from "@/lib/money";
import type { CartItem } from "@/lib/cart";

export function CartDrawer({
  isOpen,
  onClose,
  entries,
  totalCents,
  onQtyChange,
  onClear,
  whatsappHref,
}: {
  isOpen: boolean;
  onClose: () => void;
  entries: (CartItem & { productId: string })[];
  totalCents: number;
  onQtyChange: (productId: string, qty: number, meta: CartItem) => void;
  onClear: () => void;
  whatsappHref: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[82vh] max-w-md flex-col rounded-t-2xl bg-[var(--color-background)] text-[var(--color-ink)]"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-xl font-semibold">Seu pedido</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-2xl leading-none">
            &times;
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="px-5 py-8 text-center text-[var(--color-text-dim)]">Seu carrinho está vazio.</p>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-3">
            {entries.map((entry) => (
              <li key={entry.productId} className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] py-3 last:border-none">
                <div className="min-w-0">
                  <p className="font-medium">
                    {entry.name} {entry.unitLabel ? <span className="text-sm text-[var(--color-text-dim)]">{entry.unitLabel}</span> : null}
                  </p>
                  <p className="text-sm text-[var(--color-text-dim)]">{formatCentsToBRL(entry.qty * entry.priceCents)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-line)] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onQtyChange(entry.productId, entry.qty - 1, entry)}
                    aria-label="Diminuir quantidade"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                    style={{ background: "var(--color-primary)" }}
                  >
                    −
                  </button>
                  <span className="min-w-4 text-center text-sm font-semibold">{entry.qty}</span>
                  <button
                    type="button"
                    onClick={() => onQtyChange(entry.productId, entry.qty + 1, entry)}
                    aria-label="Aumentar quantidade"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                    style={{ background: "var(--color-primary)" }}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-[var(--color-line)] px-5 py-4">
          <div className="mb-3 flex items-baseline justify-between font-semibold">
            <span>Total</span>
            <span>{formatCentsToBRL(totalCents)}</span>
          </div>
          {entries.length > 0 ? (
            <button type="button" onClick={onClear} className="mb-2 w-full text-center text-sm text-[var(--color-text-dim)] underline">
              Limpar pedido
            </button>
          ) : null}
          <a
            href={whatsappHref ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!whatsappHref}
            className={`block w-full rounded-full bg-[#25d366] py-3.5 text-center font-semibold text-[#0b2410] ${
              whatsappHref ? "" : "pointer-events-none opacity-40"
            }`}
          >
            Enviar pedido no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
