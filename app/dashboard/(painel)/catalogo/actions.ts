"use server";

// Ações de escrita no catálogo global de iPhones (fotos padrão por
// modelo/cor) — restritas a quem está na allowlist de lib/admin.ts, porque
// isso é lido por todo lojista que usa o template iphone-store, não só
// quem está editando.
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { iphoneCatalogVariants } from "@/db/schema";
import { requireCatalogAdmin } from "@/lib/admin";
import { getCatalogModels } from "@/lib/iphone-catalog";
import { MAX_VARIANT_PHOTOS } from "@/lib/iphone-models";
import { imageRefSchema } from "@/lib/image-ref";
import type { MatchTargetProduct } from "@/lib/photo-match";

const CATALOGO_PATH = "/dashboard/catalogo";

/** Modelos do catálogo no mesmo formato que a tela de fotos em massa usa
 * pra casar pasta com alvo — aqui "produto" é o modelo do catálogo, sem
 * condição (o catálogo não tem Lacrado/Semi novo/CPO, só o aparelho novo). */
export async function getCatalogPhotoTargetsAction(): Promise<MatchTargetProduct[]> {
  await requireCatalogAdmin();
  const catalog = await getCatalogModels();

  return catalog.map((model) => ({
    id: model.id,
    name: model.name,
    condition: null,
    variants: model.variants.map((v, index) => ({
      // iphoneCatalogVariants não tem id nesse formato agregado — usa o
      // índice como parte da chave só pra satisfazer o tipo; o id real é
      // resolvido de novo dentro da action de attach a partir do nome da
      // cor, então isto aqui não precisa ser o uuid de verdade.
      id: `${model.id}:${v.color}:${v.storageLabel}:${index}`,
      color: v.color,
      storageLabel: v.storageLabel,
      photoCount: v.imageUrls.length,
    })),
  }));
}

const attachSchema = z.object({
  variantIds: z.array(z.string()).min(1),
  urls: z.array(imageRefSchema).min(1),
});

export interface AttachCatalogPhotosResult {
  ok: boolean;
  error?: string;
}

export async function attachPhotosToCatalogVariantsAction(payload: unknown): Promise<AttachCatalogPhotosResult> {
  await requireCatalogAdmin();

  const parsed = attachSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  // Os "ids" que chegam aqui são as chaves sintéticas de
  // getCatalogPhotoTargetsAction (modelId:cor:capacidade:índice) — resolve
  // pro modelId + cor reais e atualiza toda variação daquele modelo com
  // aquela cor de uma vez (todas as capacidades de uma cor têm a mesma
  // foto, é a mesma peça física).
  const targets = new Set<string>(); // "modelId::cor"
  for (const id of parsed.data.variantIds) {
    const [modelId, color] = id.split(":");
    if (modelId && color) targets.add(`${modelId}::${color}`);
  }
  if (targets.size === 0) return { ok: false, error: "Nenhuma variação encontrada." };

  const modelIds = [...new Set([...targets].map((t) => t.split("::")[0]))];
  const rows = await db.select().from(iphoneCatalogVariants).where(inArray(iphoneCatalogVariants.modelId, modelIds));

  let updated = 0;
  for (const row of rows) {
    if (!targets.has(`${row.modelId}::${row.color}`)) continue;
    const existing = (row.imageUrls as string[] | null) ?? [];
    const merged = [...existing];
    for (const url of parsed.data.urls) {
      if (!merged.includes(url)) merged.push(url);
    }
    await db
      .update(iphoneCatalogVariants)
      .set({ imageUrls: merged.slice(0, MAX_VARIANT_PHOTOS) })
      .where(and(eq(iphoneCatalogVariants.id, row.id)));
    updated++;
  }

  if (updated === 0) return { ok: false, error: "Nenhuma variação encontrada." };

  revalidatePath(CATALOGO_PATH);
  return { ok: true };
}
