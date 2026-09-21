"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { categories, products } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { parseBRLToCents } from "@/lib/money";
import { imageRefSchema } from "@/lib/image-ref";

// Server Actions don't auto-refresh the invoking page's data (that's only
// true for plain navigations) — every mutation below calls this so the
// dashboard reflects the change without a manual reload.
const PRODUTOS_PATH = "/dashboard/loja/produtos";

export interface FormState {
  error?: string;
}

// --- Categorias (seções e grupos) ------------------------------------------

const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  note: z.string().trim().optional(),
  parentId: z.string().uuid().optional(),
});

export async function addCategoryAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const store = await requireOwnedStore();

  const rawParentId = formData.get("parentId");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    note: formData.get("note") || undefined,
    parentId: rawParentId ? String(rawParentId) : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, note, parentId } = parsed.data;

  if (parentId) {
    const parent = await db.query.categories.findFirst({
      where: and(eq(categories.id, parentId), eq(categories.storeId, store.id)),
    });
    if (!parent) {
      return { error: "Seção inválida." };
    }
  }

  const siblingCount = await db.$count(
    categories,
    and(eq(categories.storeId, store.id), parentId ? eq(categories.parentId, parentId) : sql`${categories.parentId} is null`),
  );

  await db.insert(categories).values({
    storeId: store.id,
    parentId: parentId ?? null,
    name,
    note: note ?? null,
    sortOrder: siblingCount,
  });

  revalidatePath(PRODUTOS_PATH);
  return {};
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const store = await requireOwnedStore();
  const categoryId = String(formData.get("categoryId") ?? "");

  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.storeId, store.id)),
  });
  if (!category) return;

  const hasChildren = (await db.$count(categories, eq(categories.parentId, categoryId))) > 0;
  const hasProducts = (await db.$count(products, eq(products.categoryId, categoryId))) > 0;
  if (hasChildren || hasProducts) return; // dashboard UI keeps delete hidden in this case

  await db.delete(categories).where(eq(categories.id, categoryId));
  revalidatePath(PRODUTOS_PATH);
}

// --- Produtos ----------------------------------------------------------

const productSchema = z.object({
  categoryId: z.string().uuid("Selecione uma categoria."),
  name: z.string().trim().min(1, "Informe o nome do produto."),
  price: z.string().trim().min(1, "Informe o preço."),
  unitLabel: z.string().trim().optional(),
  description: z.string().trim().optional(),
  imageUrl: imageRefSchema.optional(),
});

async function parseProductForm(formData: FormData): Promise<
  | { ok: true; data: { categoryId: string; name: string; priceCents: number; unitLabel: string | null; description: string | null; imageUrl: string | null } }
  | { ok: false; error: string }
> {
  const parsed = productSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    price: formData.get("price"),
    unitLabel: formData.get("unitLabel") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const priceCents = parseBRLToCents(parsed.data.price);
  if (priceCents === null) {
    return { ok: false, error: "Preço inválido. Use o formato 12,50." };
  }

  return {
    ok: true,
    data: {
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      priceCents,
      unitLabel: parsed.data.unitLabel ?? null,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
    },
  };
}

export async function addProductAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const store = await requireOwnedStore();
  const result = await parseProductForm(formData);
  if (!result.ok) return { error: result.error };

  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, result.data.categoryId), eq(categories.storeId, store.id)),
  });
  if (!category) return { error: "Categoria inválida." };

  const siblingCount = await db.$count(products, eq(products.categoryId, result.data.categoryId));

  await db.insert(products).values({
    storeId: store.id,
    categoryId: result.data.categoryId,
    name: result.data.name,
    priceCents: result.data.priceCents,
    unitLabel: result.data.unitLabel,
    description: result.data.description,
    imageUrl: result.data.imageUrl,
    sortOrder: siblingCount,
  });

  revalidatePath(PRODUTOS_PATH);
  return {};
}

export async function updateProductAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const store = await requireOwnedStore();
  const productId = String(formData.get("productId") ?? "");

  const existing = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, store.id)),
  });
  if (!existing) return { error: "Produto não encontrado." };

  const result = await parseProductForm(formData);
  if (!result.ok) return { error: result.error };

  await db
    .update(products)
    .set({
      categoryId: result.data.categoryId,
      name: result.data.name,
      priceCents: result.data.priceCents,
      unitLabel: result.data.unitLabel,
      description: result.data.description,
      imageUrl: result.data.imageUrl,
    })
    .where(eq(products.id, productId));

  revalidatePath(PRODUTOS_PATH);
  return {};
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const store = await requireOwnedStore();
  const productId = String(formData.get("productId") ?? "");

  await db.delete(products).where(and(eq(products.id, productId), eq(products.storeId, store.id)));
  revalidatePath(PRODUTOS_PATH);
}

export async function toggleProductActiveAction(formData: FormData): Promise<void> {
  const store = await requireOwnedStore();
  const productId = String(formData.get("productId") ?? "");

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, store.id)),
  });
  if (!product) return;

  await db.update(products).set({ isActive: !product.isActive }).where(eq(products.id, productId));
  revalidatePath(PRODUTOS_PATH);
}

// --- Reordenar (subir/descer trocando sort_order com o vizinho) -----------

function swapIndexFor(direction: "up" | "down", index: number): number {
  return direction === "up" ? index - 1 : index + 1;
}

export async function moveCategoryAction(formData: FormData): Promise<void> {
  const store = await requireOwnedStore();
  const categoryId = String(formData.get("categoryId") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.storeId, store.id)),
  });
  if (!category) return;

  const siblings = await db
    .select({ id: categories.id, sortOrder: categories.sortOrder })
    .from(categories)
    .where(
      and(
        eq(categories.storeId, store.id),
        category.parentId ? eq(categories.parentId, category.parentId) : sql`${categories.parentId} is null`,
      ),
    )
    .orderBy(categories.sortOrder);

  const index = siblings.findIndex((s) => s.id === categoryId);
  const swapIndex = swapIndexFor(direction, index);
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) return;

  const current = siblings[index];
  const swapWith = siblings[swapIndex];
  await db.update(categories).set({ sortOrder: swapWith.sortOrder }).where(eq(categories.id, current.id));
  await db.update(categories).set({ sortOrder: current.sortOrder }).where(eq(categories.id, swapWith.id));
  revalidatePath(PRODUTOS_PATH);
}

export async function moveProductAction(formData: FormData): Promise<void> {
  const store = await requireOwnedStore();
  const productId = String(formData.get("productId") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, store.id)),
  });
  // categoryId is null for iphone-store products (that template has no
  // move-up/down UI — see IphoneProductRow) — nothing to reorder against.
  if (!product || !product.categoryId) return;
  const categoryId = product.categoryId;

  const siblings = await db
    .select({ id: products.id, sortOrder: products.sortOrder })
    .from(products)
    .where(and(eq(products.storeId, store.id), eq(products.categoryId, categoryId)))
    .orderBy(products.sortOrder);

  const index = siblings.findIndex((s) => s.id === productId);
  const swapIndex = swapIndexFor(direction, index);
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) return;

  const current = siblings[index];
  const swapWith = siblings[swapIndex];
  await db.update(products).set({ sortOrder: swapWith.sortOrder }).where(eq(products.id, current.id));
  await db.update(products).set({ sortOrder: current.sortOrder }).where(eq(products.id, swapWith.id));
  revalidatePath(PRODUTOS_PATH);
}
