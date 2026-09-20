"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { blocks, blockItems } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import type { BlockType } from "@/templates/types";

const CONTEUDO_PATH = "/dashboard/loja/conteudo";

export interface FormState {
  error?: string;
}

async function findOwnedBlock(blockId: string) {
  const store = await requireOwnedStore();
  return db.query.blocks.findFirst({
    where: and(eq(blocks.id, blockId), eq(blocks.storeId, store.id)),
  });
}

const addBlockItemSchema = z.object({
  blockId: z.string().uuid(),
  imageUrl: z.string().trim().optional(),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  body: z.string().trim().optional(),
  stars: z.coerce.number().int().min(1).max(5).optional(),
});

function validateForType(type: BlockType, data: { imageUrl?: string; title?: string; subtitle?: string; body?: string }): string | null {
  switch (type) {
    case "team":
      return data.title ? null : "Informe o nome.";
    case "gallery":
      return data.imageUrl ? null : "Informe a URL da foto.";
    case "stats":
      return data.title && data.subtitle ? null : "Informe o número e o rótulo.";
    case "chips":
      return data.title ? null : "Informe o texto.";
    case "results_carousel":
      return data.imageUrl ? null : "Informe a URL da foto.";
    case "about":
      return data.body ? null : "Informe o texto.";
    case "reviews":
      return data.body ? null : "Informe o depoimento.";
    default:
      return null;
  }
}

export async function addBlockItemAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = addBlockItemSchema.safeParse({
    blockId: formData.get("blockId"),
    imageUrl: formData.get("imageUrl") || undefined,
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    body: formData.get("body") || undefined,
    stars: formData.get("stars") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { blockId, imageUrl, title, subtitle, body, stars } = parsed.data;
  const block = await findOwnedBlock(blockId);
  if (!block) return { error: "Bloco não encontrado." };

  const typeError = validateForType(block.type, { imageUrl, title, subtitle, body });
  if (typeError) return { error: typeError };

  const siblingCount = await db.$count(blockItems, eq(blockItems.blockId, blockId));

  await db.insert(blockItems).values({
    blockId,
    position: siblingCount,
    imageUrl: imageUrl ?? null,
    title: title ?? null,
    subtitle: subtitle ?? null,
    body: body ?? null,
    meta: block.type === "reviews" ? { stars: stars ?? 5 } : {},
  });

  revalidatePath(CONTEUDO_PATH);
  return {};
}

export async function deleteBlockItemAction(formData: FormData): Promise<void> {
  const itemId = String(formData.get("itemId") ?? "");

  const item = await db.query.blockItems.findFirst({ where: eq(blockItems.id, itemId) });
  if (!item) return;
  const block = await findOwnedBlock(item.blockId);
  if (!block) return;

  await db.delete(blockItems).where(eq(blockItems.id, itemId));
  revalidatePath(CONTEUDO_PATH);
}

function swapIndexFor(direction: "up" | "down", index: number): number {
  return direction === "up" ? index - 1 : index + 1;
}

export async function moveBlockItemAction(formData: FormData): Promise<void> {
  const itemId = String(formData.get("itemId") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const item = await db.query.blockItems.findFirst({ where: eq(blockItems.id, itemId) });
  if (!item) return;
  const block = await findOwnedBlock(item.blockId);
  if (!block) return;

  const siblings = await db
    .select({ id: blockItems.id, position: blockItems.position })
    .from(blockItems)
    .where(eq(blockItems.blockId, item.blockId))
    .orderBy(blockItems.position);

  const index = siblings.findIndex((s) => s.id === itemId);
  const swapIndex = swapIndexFor(direction, index);
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) return;

  const current = siblings[index];
  const swapWith = siblings[swapIndex];
  await db.update(blockItems).set({ position: swapWith.position }).where(eq(blockItems.id, current.id));
  await db.update(blockItems).set({ position: current.position }).where(eq(blockItems.id, swapWith.id));
  revalidatePath(CONTEUDO_PATH);
}
