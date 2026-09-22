"use server";

// Importação em lote a partir do catálogo compartilhado de iPhones.
//
// O caminho de um aparelho por vez (IphoneProductForm) continua existindo
// pra quem quer ajustar tudo — fotos, bateria, observações. Esta action é o
// atalho: o lojista marca os modelos que vende, põe um preço por capacidade
// e a loja inteira nasce de uma vez.
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { products, productVariants } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { getCatalogModels } from "@/lib/iphone-catalog";
import { buildCatalogImportRows, catalogImportSchema } from "@/lib/catalog-import";

const PRODUTOS_PATH = "/dashboard/loja/produtos";

export interface ImportState {
  error?: string;
  imported?: number;
}

export async function importCatalogModelsAction(payload: unknown): Promise<ImportState> {
  const store = await requireOwnedStore();

  const parsed = catalogImportSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const [catalog, existingCount] = await Promise.all([
    getCatalogModels(),
    db.$count(products, and(eq(products.storeId, store.id), isNull(products.categoryId))),
  ]);

  const built = buildCatalogImportRows(store.id, parsed.data, catalog, existingCount);
  if (!built.ok) return { error: built.error };

  await db.insert(products).values(built.rows.products);
  await db.insert(productVariants).values(built.rows.variants);

  revalidatePath(PRODUTOS_PATH);
  revalidatePath(`/${store.slug}`);
  return { imported: built.rows.products.length };
}
