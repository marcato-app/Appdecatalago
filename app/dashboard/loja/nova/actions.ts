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

const CATALOG_TEMPLATE_SLUG = "adega-mm";

const createStoreSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja."),
  slug: z.string().trim().min(1, "Informe o link da loja."),
  whatsappNumber: z
    .string()
    .trim()
    .min(10, "Informe um número de WhatsApp válido com DDD."),
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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, slug, whatsappNumber } = parsed.data;

  const slugError = validateSlugFormat(slug);
  if (slugError) {
    return { error: slugError };
  }

  const slugTaken = await db.query.stores.findFirst({ where: eq(stores.slug, slug) });
  if (slugTaken) {
    return { error: "Esse link já está em uso, escolha outro." };
  }

  const template = await db.query.templates.findFirst({
    where: eq(templates.slug, CATALOG_TEMPLATE_SLUG),
  });
  if (!template) {
    return { error: "Modelo de catálogo não encontrado. Rode `npm run db:seed`." };
  }

  await db.insert(stores).values({
    ownerId: user.id,
    slug,
    name,
    businessType: "catalog",
    templateId: template.id,
    theme: {},
    whatsappNumber: normalizeWhatsAppNumber(whatsappNumber),
    status: "draft",
  });

  redirect("/dashboard/loja");
}
