import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { iphoneCatalogModels, iphoneCatalogVariants } from "@/db/schema";

export type CatalogModel = {
  id: string;
  name: string;
  description: string;
  specsText: string;
  /** Every (color, storage) pair the model was sold in, with the platform's
   * default photos for that color (lib/admin.ts controls who sets these). */
  variants: { color: string; storageLabel: string; imageUrls: string[] }[];
  /** Distinct colors and storages, in catalog order — what the bulk import
   * shows as chips, since price varies by storage and not by color. */
  colors: string[];
  storages: string[];
};

/** The shared reference catalog (every iPhone model, its colors, storage
 * options and default photos), in one query. It's the same for every store
 * — a regular lojista only ever reads it — so it's read whole and grouped
 * in memory rather than queried per model. */
export const getCatalogModels = cache(async (): Promise<CatalogModel[]> => {
  const rows = await db
    .select({ model: iphoneCatalogModels, variant: iphoneCatalogVariants })
    .from(iphoneCatalogModels)
    .leftJoin(iphoneCatalogVariants, eq(iphoneCatalogVariants.modelId, iphoneCatalogModels.id))
    .orderBy(asc(iphoneCatalogModels.sortOrder), asc(iphoneCatalogVariants.sortOrder));

  const byModel = new Map<string, CatalogModel>();
  for (const { model, variant } of rows) {
    let entry = byModel.get(model.id);
    if (!entry) {
      entry = {
        id: model.id,
        name: model.name,
        description: model.description,
        specsText: model.specsText,
        variants: [],
        colors: [],
        storages: [],
      };
      byModel.set(model.id, entry);
    }
    if (!variant) continue;
    entry.variants.push({
      color: variant.color,
      storageLabel: variant.storageLabel,
      imageUrls: (variant.imageUrls as string[] | null) ?? [],
    });
    if (!entry.colors.includes(variant.color)) entry.colors.push(variant.color);
    if (!entry.storages.includes(variant.storageLabel)) entry.storages.push(variant.storageLabel);
  }

  return [...byModel.values()];
});

/** Descrição longa de um modelo do catálogo: o texto comercial e a ficha
 * técnica, no mesmo formato que o formulário de um aparelho só usa. */
export function catalogModelDescription(model: Pick<CatalogModel, "description" | "specsText">): string {
  return [model.description, model.specsText].filter(Boolean).join("\n\n");
}

/** As fotos padrão de uma cor do catálogo — todas as capacidades daquela
 * cor têm a mesma foto (é a mesma cor física), então basta a primeira
 * variação que tiver alguma. */
export function catalogColorPhotos(model: Pick<CatalogModel, "variants">, color: string): string[] {
  return model.variants.find((v) => v.color === color && v.imageUrls.length > 0)?.imageUrls ?? [];
}
