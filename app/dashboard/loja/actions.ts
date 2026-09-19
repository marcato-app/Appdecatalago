"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { stores } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

const updateStoreSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja."),
  tagline: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  whatsappNumber: z.string().trim().min(10, "Informe um número de WhatsApp válido com DDD."),
  instagramHandle: z.string().trim().optional(),
  addressLine: z.string().trim().optional(),
});

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function updateStoreAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const store = await requireOwnedStore();

  const parsed = updateStoreSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline") || undefined,
    bio: formData.get("bio") || undefined,
    whatsappNumber: formData.get("whatsappNumber"),
    instagramHandle: formData.get("instagramHandle") || undefined,
    addressLine: formData.get("addressLine") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, tagline, bio, whatsappNumber, instagramHandle, addressLine } = parsed.data;

  await db
    .update(stores)
    .set({
      name,
      tagline: tagline ?? null,
      bio: bio ?? null,
      whatsappNumber: normalizeWhatsAppNumber(whatsappNumber),
      instagramHandle: instagramHandle ?? null,
      addressLine: addressLine ?? null,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, store.id));

  revalidatePath("/dashboard/loja");
  return { success: true };
}

export async function togglePublishAction(): Promise<void> {
  const store = await requireOwnedStore();
  const nextStatus = store.status === "published" ? "draft" : "published";

  await db
    .update(stores)
    .set({
      status: nextStatus,
      publishedAt: nextStatus === "published" ? new Date() : store.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, store.id));

  redirect("/dashboard/loja");
}
