import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { stores, templates } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

// Phase 1 assumes one store per lojista (schema supports more; the UI just
// doesn't expose it yet — see ARCHITECTURE.md "Fase 1").
//
// Wrapped in cache() for the same reason as getCurrentUser() — the
// dashboard's shell layout and the page it wraps both need "the current
// user's store", and without this each one re-queries it.
export const getStoreByOwnerId = cache(async (ownerId: string) => {
  return (await db.query.stores.findFirst({ where: eq(stores.ownerId, ownerId) })) ?? null;
});

export async function getStoreBySlug(slug: string) {
  return (await db.query.stores.findFirst({ where: eq(stores.slug, slug) })) ?? null;
}

/** For dashboard server actions: resolves the current user's store, or
 * redirects to create one. Centralizes the ownership check so every
 * mutation (loja, produtos) is scoped to the signed-in lojista's own data. */
export async function requireOwnedStore() {
  const user = await requireUser();
  const store = await getStoreByOwnerId(user.id);
  if (!store) {
    redirect("/dashboard/loja/nova");
  }
  return store;
}

/** The store plus the slug of its template, in a single round trip. Every
 * dashboard page needs both (the template slug decides which management UI
 * to render), and fetching them separately meant an extra sequential query
 * — noticeable when the database is a region away. */
export const getStoreWithTemplateByOwnerId = cache(async (ownerId: string) => {
  const [row] = await db
    .select({ store: stores, templateSlug: templates.slug })
    .from(stores)
    .leftJoin(templates, eq(templates.id, stores.templateId))
    .where(eq(stores.ownerId, ownerId))
    .limit(1);

  return row ?? null;
});

export async function requireOwnedStoreWithTemplate() {
  const user = await requireUser();
  const row = await getStoreWithTemplateByOwnerId(user.id);
  if (!row) {
    redirect("/dashboard/loja/nova");
  }
  return row;
}
