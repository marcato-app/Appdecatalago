"use client";

import { ProductRow } from "./ProductRow";
import type { CardapioSection } from "./types";

export function CategorySection({
  section,
  getQty,
  onQtyChange,
}: {
  section: CardapioSection;
  getQty: (productId: string) => number;
  onQtyChange: (productId: string, qty: number) => void;
}) {
  return (
    <section id={section.id} className="scroll-mt-24 py-6">
      <h2
        className="border-b pb-2 text-2xl font-semibold"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
      >
        {section.name}
      </h2>
      {section.note ? <p className="mt-2 text-sm italic text-[var(--color-text-dim)]">{section.note}</p> : null}

      {section.products.length > 0 ? (
        <div className="mt-2">
          {section.products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              qty={getQty(product.id)}
              onQtyChange={(qty) => onQtyChange(product.id, qty)}
            />
          ))}
        </div>
      ) : null}

      {section.groups.map((group) => (
        <div key={group.id} className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-dim)]">{group.name}</h3>
          {group.note ? <p className="mt-1 text-sm italic text-[var(--color-text-dim)]">{group.note}</p> : null}
          <div className="mt-1">
            {group.products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                qty={getQty(product.id)}
                onQtyChange={(qty) => onQtyChange(product.id, qty)}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
