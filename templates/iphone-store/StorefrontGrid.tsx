"use client";

import { useMemo, useState, type ReactNode } from "react";
import { IPHONE_CONDITION_LABELS } from "@/lib/iphone-models";
import type { StorefrontSettings } from "@/lib/storefront-settings";
import { SearchIcon } from "./icons";
import { ProductCard } from "./ProductCard";
import styles from "./Storefront.module.css";
import type { IphoneCondition, IphoneProductDto } from "./types";

type SortRule = "relevancia" | "novos" | "menor_preco" | "maior_preco";

function cheapestCents(product: IphoneProductDto): number {
  return product.variants.reduce((min, v) => Math.min(min, v.priceCents), Infinity);
}

// Owns all the interactive state (search/filter/sort) — the sticky header
// above the grid is server-rendered (avatar, tagline, trust badges) and
// passed in as `header` so this component only needs to add the search bar
// and filter chips underneath it, both inside the same sticky block.
export function StorefrontGrid({
  header,
  products,
  storeSlug,
  settings,
}: {
  header: ReactNode;
  products: IphoneProductDto[];
  storeSlug: string;
  settings: StorefrontSettings;
}) {
  const [query, setQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState<IphoneCondition | "todos">("todos");
  const [sortRule, setSortRule] = useState<SortRule>("relevancia");

  const availableConditions = useMemo(
    () => Array.from(new Set(products.map((p) => p.condition).filter((c): c is IphoneCondition => c !== null))),
    [products],
  );

  const visible = useMemo(() => {
    let list = products;

    const needle = query.trim().toLowerCase();
    if (needle) list = list.filter((p) => p.name.toLowerCase().includes(needle));

    if (conditionFilter !== "todos") list = list.filter((p) => p.condition === conditionFilter);

    const sorted = [...list];
    if (sortRule === "novos") sorted.reverse();
    else if (sortRule === "menor_preco") sorted.sort((a, b) => cheapestCents(a) - cheapestCents(b));
    else if (sortRule === "maior_preco") sorted.sort((a, b) => cheapestCents(b) - cheapestCents(a));

    return sorted;
  }, [products, query, conditionFilter, sortRule]);

  return (
    <>
      <header className={styles.header}>
        {header}

        <div className={styles.searchRow}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Digite um modelo..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterChips}>
            <button
              type="button"
              onClick={() => setConditionFilter("todos")}
              className={`${styles.filterChip} ${conditionFilter === "todos" ? styles.filterChipActive : ""}`}
            >
              Todos
            </button>
            {availableConditions.map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() => setConditionFilter(condition)}
                className={`${styles.filterChip} ${conditionFilter === condition ? styles.filterChipActive : ""}`}
              >
                {IPHONE_CONDITION_LABELS[condition]}
              </button>
            ))}
          </div>
          <select
            className={styles.sortSelect}
            value={sortRule}
            onChange={(event) => setSortRule(event.target.value as SortRule)}
          >
            <option value="relevancia">Relevância</option>
            <option value="novos">Mais novos</option>
            <option value="menor_preco">Menor preço</option>
            <option value="maior_preco">Maior preço</option>
          </select>
        </div>
      </header>

      <p className={styles.resultsCount}>Exibindo {visible.length} produtos</p>

      <div className={`${styles.grid} ${settings.displayMode === "grande" ? styles.gridLarge : styles.gridCompact}`}>
        {visible.length === 0 ? (
          <p className={styles.emptyState}>Nenhum aparelho encontrado.</p>
        ) : (
          visible.map((product) => <ProductCard key={product.id} product={product} storeSlug={storeSlug} settings={settings} />)
        )}
      </div>
    </>
  );
}
