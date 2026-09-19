"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { SearchBar } from "./SearchBar";
import { CategorySection } from "./CategorySection";
import { CartBar } from "./CartBar";
import { CartDrawer } from "./CartDrawer";
import type { CardapioSection } from "./types";

function matches(query: string, ...values: (string | null)[]): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return values.some((value) => value?.toLowerCase().includes(needle));
}

function filterSections(sections: CardapioSection[], query: string): CardapioSection[] {
  if (!query.trim()) return sections;

  return sections
    .map((section) => ({
      ...section,
      products: section.products.filter((p) => matches(query, p.name, p.description, p.unitLabel)),
      groups: section.groups
        .map((group) => ({
          ...group,
          products: group.products.filter((p) => matches(query, p.name, p.description, p.unitLabel)),
        }))
        .filter((group) => group.products.length > 0),
    }))
    .filter((section) => section.products.length > 0 || section.groups.length > 0);
}

export function CardapioView({
  storeId,
  storeName,
  whatsappNumber,
  sections,
}: {
  storeId: string;
  storeName: string;
  whatsappNumber: string | null;
  sections: CardapioSection[];
}) {
  const [query, setQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useCart(storeId);

  const filteredSections = useMemo(() => filterSections(sections, query), [sections, query]);
  const cartMap = useMemo(() => new Map(cart.entries.map((entry) => [entry.productId, entry])), [cart.entries]);

  const whatsappHref = useMemo(() => {
    if (!whatsappNumber || cart.entries.length === 0) return null;
    const message = buildOrderMessage(
      storeName,
      cart.entries.map((entry) => ({
        name: entry.name,
        unitLabel: entry.unitLabel,
        priceCents: entry.priceCents,
        quantity: entry.qty,
      })),
    );
    return buildWhatsAppLink(whatsappNumber, message);
  }, [whatsappNumber, cart.entries, storeName]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-[var(--color-background)] px-5 pb-28 text-[var(--color-ink)]">
      <div className="sticky top-0 z-30 bg-[var(--color-background)] py-4">
        <h1 className="mb-3 text-center text-2xl font-semibold" style={{ fontFamily: "var(--font-display, inherit)" }}>
          {storeName}
        </h1>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {filteredSections.length === 0 ? (
        <p className="py-10 text-center text-[var(--color-text-dim)]">Nenhum item encontrado.</p>
      ) : (
        filteredSections.map((section) => (
          <CategorySection
            key={section.id}
            section={section}
            getQty={(productId) => cartMap.get(productId)?.qty ?? 0}
            onQtyChange={(productId, qty) => {
              const product = [...section.products, ...section.groups.flatMap((g) => g.products)].find(
                (p) => p.id === productId,
              );
              if (!product) return;
              cart.setQty(productId, qty, {
                name: product.name,
                unitLabel: product.unitLabel,
                priceCents: product.priceCents,
              });
            }}
          />
        ))
      )}

      <CartBar totalCount={cart.totalCount} totalCents={cart.totalCents} onOpen={() => setIsCartOpen(true)} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        entries={cart.entries}
        totalCents={cart.totalCents}
        onQtyChange={cart.setQty}
        onClear={cart.clear}
        whatsappHref={whatsappHref}
      />
    </div>
  );
}
