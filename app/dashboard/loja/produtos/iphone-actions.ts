"use server";

// Server Actions for the iphone-store template's product management —
// separate from actions.ts because this template doesn't use
// categories/sections at all (products are grouped by `condition` instead)
// and each product owns a variants array (color/storage/price/photos)
// saved as a whole on every submit, rather than the category+single-product
// CRUD the generic catalog UI (ProductItem.tsx) uses.
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { products, productVariants } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { parseBRLToCents } from "@/lib/money";
import { imageRefSchema } from "@/lib/image-ref";

const PRODUTOS_PATH = "/dashboard/loja/produtos";

export interface FormState {
  error?: string;
}

const variantInputSchema = z.object({
  color: z.string().trim().min(1, "Informe a cor."),
  storageLabel: z.string().trim().optional(),
  price: z.string().trim().min(1, "Informe o preço."),
  imageUrls: z.array(imageRefSchema).max(4).default([]),
});

const iphoneProductSchema = z.object({
  name: z.string().trim().min(1, "Informe o modelo."),
  condition: z.enum(["lacrado", "seminovo", "cpo"], { message: "Escolha a condição." }),
  grade: z.string().trim().optional(),
  batteryHealthPct: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.string().optional(),
  variantsJson: z.string(),
});

interface ParsedIphoneProduct {
  name: string;
  condition: "lacrado" | "seminovo" | "cpo";
  grade: string | null;
  batteryHealthPct: number | null;
  description: string | null;
  includedItems: string[];
  isActive: boolean;
  priceCents: number;
  imageUrl: string | null;
  variants: { color: string; storageLabel: string | null; priceCents: number; imageUrls: string[] }[];
}

function parseIphoneProductForm(formData: FormData): { ok: true; data: ParsedIphoneProduct } | { ok: false; error: string } {
  const parsed = iphoneProductSchema.safeParse({
    name: formData.get("name"),
    condition: formData.get("condition"),
    grade: formData.get("grade") || undefined,
    batteryHealthPct: formData.get("batteryHealthPct") || undefined,
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive") || undefined,
    variantsJson: formData.get("variantsJson") || "[]",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let rawVariants: unknown;
  try {
    rawVariants = JSON.parse(parsed.data.variantsJson);
  } catch {
    return { ok: false, error: "Variações inválidas." };
  }

  const variantsParsed = z.array(variantInputSchema).min(1, "Adicione pelo menos uma cor/armazenamento.").safeParse(rawVariants);
  if (!variantsParsed.success) {
    return { ok: false, error: variantsParsed.error.issues[0]?.message ?? "Variações inválidas." };
  }

  const variants: ParsedIphoneProduct["variants"] = [];
  for (const variant of variantsParsed.data) {
    const priceCents = parseBRLToCents(variant.price);
    if (priceCents === null) {
      return { ok: false, error: `Preço inválido para a cor "${variant.color}". Use o formato 1500,00.` };
    }
    variants.push({
      color: variant.color,
      storageLabel: variant.storageLabel || null,
      priceCents,
      imageUrls: variant.imageUrls.slice(0, 4),
    });
  }

  let batteryHealthPct: number | null = null;
  if (parsed.data.batteryHealthPct) {
    const n = Number(parsed.data.batteryHealthPct);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      return { ok: false, error: "Saúde da bateria deve ser entre 0 e 100." };
    }
    batteryHealthPct = Math.round(n);
  }

  const includedItems = formData.getAll("includedItems").map((v) => String(v).trim()).filter(Boolean);
  const cheapest = variants.reduce((min, v) => (v.priceCents < min.priceCents ? v : min), variants[0]);

  return {
    ok: true,
    data: {
      name: parsed.data.name,
      condition: parsed.data.condition,
      grade: parsed.data.condition === "seminovo" ? (parsed.data.grade ?? null) || null : null,
      batteryHealthPct,
      description: parsed.data.description || null,
      includedItems,
      isActive: parsed.data.isActive === "on",
      priceCents: cheapest.priceCents,
      imageUrl: cheapest.imageUrls[0] ?? null,
      variants,
    },
  };
}

async function replaceVariants(productId: string, variants: ParsedIphoneProduct["variants"]): Promise<void> {
  await db.delete(productVariants).where(eq(productVariants.productId, productId));
  await db.insert(productVariants).values(
    variants.map((variant, index) => ({
      productId,
      color: variant.color,
      storageLabel: variant.storageLabel,
      priceCents: variant.priceCents,
      imageUrls: variant.imageUrls,
      sortOrder: index,
    })),
  );
}

export async function addIphoneProductAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const store = await requireOwnedStore();
  const result = parseIphoneProductForm(formData);
  if (!result.ok) return { error: result.error };

  const siblingCount = await db.$count(products, and(eq(products.storeId, store.id), isNull(products.categoryId)));

  const [inserted] = await db
    .insert(products)
    .values({
      storeId: store.id,
      categoryId: null,
      name: result.data.name,
      priceCents: result.data.priceCents,
      imageUrl: result.data.imageUrl,
      description: result.data.description,
      condition: result.data.condition,
      grade: result.data.grade,
      batteryHealthPct: result.data.batteryHealthPct,
      includedItems: result.data.includedItems,
      isActive: result.data.isActive,
      sortOrder: siblingCount,
    })
    .returning({ id: products.id });

  await replaceVariants(inserted.id, result.data.variants);

  revalidatePath(PRODUTOS_PATH);
  return {};
}

export async function updateIphoneProductAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const store = await requireOwnedStore();
  const productId = String(formData.get("productId") ?? "");

  const existing = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, store.id)),
  });
  if (!existing) return { error: "Aparelho não encontrado." };

  const result = parseIphoneProductForm(formData);
  if (!result.ok) return { error: result.error };

  await db
    .update(products)
    .set({
      name: result.data.name,
      priceCents: result.data.priceCents,
      imageUrl: result.data.imageUrl,
      description: result.data.description,
      condition: result.data.condition,
      grade: result.data.grade,
      batteryHealthPct: result.data.batteryHealthPct,
      includedItems: result.data.includedItems,
      isActive: result.data.isActive,
    })
    .where(eq(products.id, productId));

  await replaceVariants(productId, result.data.variants);

  revalidatePath(PRODUTOS_PATH);
  return {};
}
