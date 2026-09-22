import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { stores, templates } from "@/db/schema";
import { getSessionContext } from "@/lib/auth/session";

// Phase 1 assumes one store per lojista (schema supports more; the UI just
// doesn't expose it yet — see ARCHITECTURE.md "Fase 1").
export const getStoreByOwnerId = cache(async (ownerId: string) => {
  return (await db.query.stores.findFirst({ where: eq(stores.ownerId, ownerId) })) ?? null;
});

/** The public storefront's store + its template slug, in one round trip.
 * Cached because generateMetadata() and the page itself both need it —
 * without this every public page view ran the same query twice. */
export const getStoreBySlugWithTemplate = cache(async (slug: string) => {
  const [row] = await db
    .select({ store: stores, templateSlug: templates.slug })
    .from(stores)
    .leftJoin(templates, eq(templates.id, stores.templateId))
    .where(eq(stores.slug, slug))
    .limit(1);

  return row ?? null;
});

export async function getStoreBySlug(slug: string) {
  return (await getStoreBySlugWithTemplate(slug))?.store ?? null;
}

/** For dashboard server actions: resolves the current user's store, or
 * redirects to create one. Centralizes the ownership check so every
 * mutation (loja, produtos) is scoped to the signed-in lojista's own data.
 *
 * Reads it off the session context, which already loaded user + store +
 * template together — so this costs no extra database round trip. */
export async function requireOwnedStore() {
  return (await requireOwnedStoreWithTemplate()).store;
}

export async function requireOwnedStoreWithTemplate() {
  const session = await getSessionContext();
  if (!session) {
    redirect("/dashboard/login");
  }
  if (!session.store) {
    redirect("/dashboard/loja/nova");
  }
  return { store: session.store, templateSlug: session.templateSlug };
}

/** The signed-in lojista's store (or null), without redirecting — for the
 * dashboard shell, which also renders on /dashboard/loja/nova where there
 * is no store yet. */
export async function getOwnedStore() {
  return (await getSessionContext())?.store ?? null;
}
