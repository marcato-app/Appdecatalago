import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { stores, templates, users } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionContext = {
  user: typeof users.$inferSelect;
  store: typeof stores.$inferSelect | null;
  templateSlug: string | null;
};

// Backed by Supabase Auth. `users` here is our own profile table (name,
// links to stores etc.) — `authProviderId` links each row to the matching
// Supabase auth user.
//
// Everything the dashboard needs before it can render anything at all — who
// is signed in, which store is theirs, which template that store uses —
// comes back from this single joined query. It used to be three sequential
// round trips (auth server → users → stores → templates); against a
// database a region away from the Worker that alone was most of the wait
// before the first byte.
//
// Uses getClaims() rather than getUser(): getUser() always hits Supabase's
// auth server over the network. getClaims() verifies the access token's
// signature locally (WebCrypto + cached JWKS) and only falls back to a
// network call for legacy symmetric tokens, so the common path is pure
// local work.
//
// cache() scopes the whole thing to one request — a layout, the page it
// wraps and any server action they trigger all share one answer.
export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const authProviderId = claims?.sub;
  if (!authProviderId) return null;

  const [row] = await db
    .select({ user: users, store: stores, templateSlug: templates.slug })
    .from(users)
    .leftJoin(stores, eq(stores.ownerId, users.id))
    .leftJoin(templates, eq(templates.id, stores.templateId))
    .where(eq(users.authProviderId, authProviderId))
    .limit(1);

  if (row) return { user: row.user, store: row.store, templateSlug: row.templateSlug };

  // Only needed to create the profile row — an existing lojista is resolved
  // by `sub` above, so a session whose token happens not to carry an email
  // claim never gets bounced back to login.
  const email = claims?.email;
  if (!email) return null;

  // First time we see this Supabase auth user (normally created already by
  // the signup action — this is just a safety net, e.g. for a future OAuth
  // provider that skips our own signup form).
  const [created] = await db
    .insert(users)
    .values({
      email,
      authProviderId,
      name: typeof claims?.user_metadata?.name === "string" ? claims.user_metadata.name : null,
    })
    .returning();

  return { user: created, store: null, templateSlug: null };
});

export async function getCurrentUser() {
  return (await getSessionContext())?.user ?? null;
}

/** Redirects to login when there's no valid session. Use at the top of every
 * dashboard page/server action — proxy.ts is a first line of defense, not
 * the only one (see Next.js Server Function auth guidance). */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/dashboard/login");
  }
  return user;
}
