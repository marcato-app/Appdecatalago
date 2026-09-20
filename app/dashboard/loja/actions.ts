"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { stores, storeLinks } from "@/db/schema";
import { requireOwnedStore } from "@/lib/stores";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { isValidCnpj } from "@/lib/cnpj";
import { findBusinessCategory } from "@/lib/business-categories";
import { buildThemeOverride } from "@/lib/theme-presets";

const LOJA_PATH = "/dashboard/loja";

const updateStoreSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja."),
  tagline: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  whatsappNumber: z.string().trim().min(10, "Informe um número de WhatsApp válido com DDD."),
  instagramHandle: z.string().trim().optional(),
  addressLine: z.string().trim().optional(),
  businessCategory: z.string().trim().min(1, "Escolha o ramo de atividade."),
  cnpj: z.string().trim().optional(),
  colorPresetId: z.string().trim().optional(),
  fontPresetId: z.string().trim().optional(),
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
    businessCategory: formData.get("businessCategory"),
    cnpj: formData.get("cnpj") || undefined,
    colorPresetId: formData.get("colorPresetId") || undefined,
    fontPresetId: formData.get("fontPresetId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const {
    name,
    tagline,
    bio,
    whatsappNumber,
    instagramHandle,
    addressLine,
    businessCategory,
    cnpj,
    colorPresetId,
    fontPresetId,
  } = parsed.data;

  if (!findBusinessCategory(businessCategory)) {
    return { error: "Ramo de atividade inválido." };
  }

  let cnpjDigits: string | null = null;
  if (cnpj) {
    cnpjDigits = cnpj.replace(/\D/g, "");
    if (!isValidCnpj(cnpjDigits)) {
      return { error: "CNPJ inválido. Confira os números digitados." };
    }
  }

  await db
    .update(stores)
    .set({
      name,
      tagline: tagline ?? null,
      bio: bio ?? null,
      whatsappNumber: normalizeWhatsAppNumber(whatsappNumber),
      instagramHandle: instagramHandle ?? null,
      addressLine: addressLine ?? null,
      businessCategory,
      cnpj: cnpjDigits,
      theme: buildThemeOverride(colorPresetId, fontPresetId),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, store.id));

  revalidatePath(LOJA_PATH);
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

// --- Links extras (site, App Store, Play Store, outros) --------------------
// Instagram e WhatsApp continuam campos dedicados (acima) — esses são os
// "e outros links/redes sociais" adicionais do pedido original.

const LINK_TYPES = ["website", "app_store", "play_store", "custom"] as const;

const storeLinkSchema = z.object({
  type: z.enum(LINK_TYPES),
  label: z.string().trim().min(1, "Informe um nome pro link."),
  url: z.string().trim().url("Informe uma URL válida (começando com https://)."),
});

export interface LinkFormState {
  error?: string;
}

export async function addStoreLinkAction(_prevState: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const store = await requireOwnedStore();

  const parsed = storeLinkSchema.safeParse({
    type: formData.get("type"),
    label: formData.get("label"),
    url: formData.get("url"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const siblingCount = await db.$count(storeLinks, eq(storeLinks.storeId, store.id));

  await db.insert(storeLinks).values({
    storeId: store.id,
    type: parsed.data.type,
    label: parsed.data.label,
    url: parsed.data.url,
    sortOrder: siblingCount,
  });

  revalidatePath(LOJA_PATH);
  return {};
}

export async function deleteStoreLinkAction(formData: FormData): Promise<void> {
  const store = await requireOwnedStore();
  const linkId = String(formData.get("linkId") ?? "");

  await db.delete(storeLinks).where(and(eq(storeLinks.id, linkId), eq(storeLinks.storeId, store.id)));
  revalidatePath(LOJA_PATH);
}
