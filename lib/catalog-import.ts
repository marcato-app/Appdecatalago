import { z } from "zod";
import type { products, productVariants } from "@/db/schema";
import { catalogColorPhotos, catalogModelDescription, type CatalogModel } from "@/lib/iphone-catalog";
import { parseBRLToCents } from "@/lib/money";

export const catalogImportSchema = z.object({
  condition: z.enum(["lacrado", "seminovo", "cpo"]),
  grade: z.string().trim().optional(),
  batteryHealthPct: z.number().int().min(0).max(100).nullable().optional(),
  includedItems: z.array(z.string().trim().min(1)).max(20).default([]),
  models: z
    .array(
      z.object({
        id: z.string().uuid(),
        colors: z.array(z.string().trim().min(1)).min(1),
        /** { "128 GB": "4.500,00" } — capacidade sem preço é ignorada. */
        prices: z.record(z.string(), z.string()),
      }),
    )
    .min(1, "Escolha pelo menos um modelo.")
    .max(60),
});

export type CatalogImportInput = z.infer<typeof catalogImportSchema>;

export type CatalogImportRows = {
  products: (typeof products.$inferInsert)[];
  variants: (typeof productVariants.$inferInsert)[];
};

/** Transforma a seleção do lojista nas linhas a inserir. Puro de propósito:
 * é onde está toda a regra (preço por capacidade × cores escolhidas, qual
 * variação vira o preço "a partir de", o que é ignorado) e o único jeito de
 * testar isso sem subir meio app. */
export function buildCatalogImportRows(
  storeId: string,
  input: CatalogImportInput,
  catalog: CatalogModel[],
  startSortOrder: number,
): { ok: true; rows: CatalogImportRows } | { ok: false; error: string } {
  const catalogById = new Map(catalog.map((model) => [model.id, model]));
  const rows: CatalogImportRows = { products: [], variants: [] };

  for (const selection of input.models) {
    const model = catalogById.get(selection.id);
    if (!model) return { ok: false, error: "Modelo do catálogo não encontrado. Recarregue a página." };

    // Preço é por capacidade (é assim que iPhone é vendido) e vale pra todas
    // as cores escolhidas daquela capacidade.
    const pricedStorages: { storageLabel: string; priceCents: number }[] = [];
    for (const storageLabel of model.storages) {
      const raw = selection.prices[storageLabel]?.trim();
      if (!raw) continue;
      const priceCents = parseBRLToCents(raw);
      if (priceCents === null) {
        return { ok: false, error: `Preço inválido em ${model.name} · ${storageLabel}. Use o formato 4500,00.` };
      }
      pricedStorages.push({ storageLabel, priceCents });
    }
    if (pricedStorages.length === 0) continue;

    const colors = model.colors.filter((color) => selection.colors.includes(color));
    if (colors.length === 0) continue;

    // O id é gerado aqui (em vez de deixar o banco gerar e depois ler de
    // volta) pra poder montar produtos e variações nos dois únicos INSERTs
    // que a importação faz, sem depender da ordem do RETURNING.
    const productId = crypto.randomUUID();
    const cheapest = pricedStorages.reduce((min, s) => (s.priceCents < min.priceCents ? s : min));

    // Fotos padrão do catálogo global só entram em aparelho Lacrado — um
    // seminovo/CPO tem marcas de uso reais que a foto genérica não mostra,
    // então essas condições sempre começam sem foto (o lojista sobe a foto
    // do aparelho que ele realmente tem).
    let sortOrder = 0;
    for (const { storageLabel, priceCents } of pricedStorages) {
      for (const color of colors) {
        const imageUrls = input.condition === "lacrado" ? catalogColorPhotos(model, color) : [];
        rows.variants.push({ productId, color, storageLabel, priceCents, imageUrls, sortOrder: sortOrder++ });
      }
    }

    rows.products.push({
      id: productId,
      storeId,
      categoryId: null,
      name: model.name,
      priceCents: cheapest.priceCents,
      imageUrl: null,
      description: catalogModelDescription(model),
      condition: input.condition,
      grade: input.condition === "seminovo" ? input.grade || null : null,
      batteryHealthPct: input.batteryHealthPct ?? null,
      includedItems: input.includedItems,
      isActive: true,
      sortOrder: startSortOrder + rows.products.length,
    });
  }

  if (rows.products.length === 0) {
    return { ok: false, error: "Preencha o preço de pelo menos uma capacidade." };
  }

  return { ok: true, rows };
}
