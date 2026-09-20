"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { stores, templates } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { getStoreByOwnerId } from "@/lib/stores";
import { slugify, validateSlugFormat } from "@/lib/slug";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { isValidCnpj } from "@/lib/cnpj";
import { findBusinessCategory } from "@/lib/business-categories";
import { buildThemeOverride } from "@/lib/theme-presets";
import { templateManifests } from "@/templates/registry";

const createStoreSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja."),
  slug: z.string().trim().min(1, "Informe o link da loja."),
  whatsappNumber: z
    .string()
    .trim()
    .min(10, "Informe um número de WhatsApp válido com DDD."),
  businessCategory: z.string().trim().min(1, "Escolha o ramo de atividade."),
  templateSlug: z.string().trim().min(1, "Escolha um modelo."),
  cnpj: z.string().trim().optional(),
  colorPresetId: z.string().trim().optional(),
  fontPresetId: z.string().trim().optional(),
});

export interface FormState {
  error?: string;
}

export async function createStoreAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const existingStore = await getStoreByOwnerId(user.id);
  if (existingStore) {
    redirect("/dashboard/loja");
  }

  const parsed = createStoreSchema.safeParse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") ?? "")),
    whatsappNumber: formData.get("whatsappNumber"),
    businessCategory: formData.get("businessCategory"),
    templateSlug: formData.get("templateSlug"),
    cnpj: formData.get("cnpj") || undefined,
    colorPresetId: formData.get("colorPresetId") || undefined,
    fontPresetId: formData.get("fontPresetId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, slug, whatsappNumber, businessCategory, templateSlug, cnpj, colorPresetId, fontPresetId } = parsed.data;

  const slugError = validateSlugFormat(slug);
  if (slugError) {
    return { error: slugError };
  }

  const slugTaken = await db.query.stores.findFirst({ where: eq(stores.slug, slug) });
  if (slugTaken) {
    return { error: "Esse link já está em uso, escolha outro." };
  }

  if (!findBusinessCategory(businessCategory)) {
    return { error: "Ramo de atividade inválido." };
  }

  const manifest = templateManifests.find((m) => m.slug === templateSlug);
  if (!manifest) {
    return { error: "Modelo inválido." };
  }

  let cnpjDigits: string | null = null;
  if (cnpj) {
    cnpjDigits = cnpj.replace(/\D/g, "");
    if (!isValidCnpj(cnpjDigits)) {
      return { error: "CNPJ inválido. Confira os números digitados." };
    }
  }

  const template = await db.query.templates.findFirst({
    where: eq(templates.slug, manifest.slug),
  });
  if (!template) {
    return { error: "Modelo não encontrado. Rode `npm run db:seed`." };
  }

  await db.insert(stores).values({
    ownerId: user.id,
    slug,
    name,
    businessType: manifest.businessType,
    businessCategory,
    cnpj: cnpjDigits,
    templateId: template.id,
    theme: buildThemeOverride(colorPresetId, fontPresetId),
    whatsappNumber: normalizeWhatsAppNumber(whatsappNumber),
    status: "draft",
  });

  redirect("/dashboard/loja");
}
