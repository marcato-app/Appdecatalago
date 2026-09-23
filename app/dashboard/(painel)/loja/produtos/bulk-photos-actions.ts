"use server";

// Importação de fotos em massa: casa uma estrutura de pastas
// "Modelo/Cor/foto.jpg" (a mesma que o app Arquivos do iPhone exporta) com
// os aparelhos já cadastrados na loja. O casamento em si roda no navegador
// (lib/photo-match.ts, puro) — este arquivo só entrega os alvos possíveis e,
// depois que o lojista confirma, sobe os arquivos e grava as URLs.
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { products, productVariants } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { getIphoneProducts } from "@/lib/iphone-products";
import { MAX_VARIANT_PHOTOS } from "@/lib/iphone-models";
import { imageRefSchema } from "@/lib/image-ref";
import { z } from "zod";
import type { MatchTargetProduct } from "@/lib/photo-match";

const PRODUTOS_PATH = "/dashboard/loja/produtos";

export async function getBulkPhotoTargetsAction(): Promise<MatchTargetProduct[]> {
  const store = await requireOwnedStore();
  const items = await getIphoneProducts(store.id);

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    condition: item.condition,
    variants: item.variants.map((v) => ({
      id: v.id,
      color: v.color,
      storageLabel: v.storageLabel,
      photoCount: v.imageUrls.length,
    })),
  }));
}

const attachSchema = z.object({
  variantIds: z.array(z.string().uuid()).min(1),
  urls: z.array(imageRefSchema).min(1),
});

export interface AttachPhotosResult {
  ok: boolean;
  error?: string;
}

/** Aplica o mesmo conjunto de fotos a uma ou mais variações de uma vez — é
 * assim que uma pasta "Modelo/Cor" vira fotos em várias capacidades daquela
 * cor (e em mais de uma condição, se o mesmo modelo existir lacrado e semi
 * novo). Soma às fotos que a variação já tinha (não substitui) e corta em
 * MAX_VARIANT_PHOTOS — rodar a importação de novo não perde nada. */
export async function attachPhotosToVariantsAction(payload: unknown): Promise<AttachPhotosResult> {
  const store = await requireOwnedStore();

  const parsed = attachSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  // Confere que toda variação pertence a um produto desta loja antes de
  // gravar qualquer coisa — sem isso, um id fabricado poderia escrever foto
  // na variação de outra loja.
  const rows = await db
    .select({ variant: productVariants, storeId: products.storeId })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(inArray(productVariants.id, parsed.data.variantIds));

  const owned = rows.filter((row) => row.storeId === store.id);
  if (owned.length === 0) {
    return { ok: false, error: "Nenhuma variação encontrada." };
  }

  for (const { variant } of owned) {
    const existing = (variant.imageUrls as string[] | null) ?? [];
    const merged = [...existing];
    for (const url of parsed.data.urls) {
      if (!merged.includes(url)) merged.push(url);
    }
    await db
      .update(productVariants)
      .set({ imageUrls: merged.slice(0, MAX_VARIANT_PHOTOS) })
      .where(and(eq(productVariants.id, variant.id)));
  }

  revalidatePath(PRODUTOS_PATH);
  revalidatePath(`/${store.slug}`);
  return { ok: true };
}
