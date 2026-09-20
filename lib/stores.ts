import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { stores } from "@/db/schema";
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
