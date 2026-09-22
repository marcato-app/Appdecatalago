import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Backed by Supabase Auth. `users` here is our own profile table (name,
// links to stores etc.) — `authProviderId` links each row to the matching
// Supabase auth user. Every dashboard page/action only ever calls
// getCurrentUser()/requireUser(), so this is the one place that knows about
// Supabase specifically.
//
// Wrapped in cache() — a layout and the page it wraps (or several
// components in the same tree) commonly each call requireUser() on their
// own; without this every one of them repeats the auth check plus a
// users-table lookup for what is, within one request, always the same
// answer.
//
// Uses getClaims() rather than getUser(): getUser() always hits Supabase's
// auth server over the network, which on Cloudflare Workers meant every
// dashboard page waited on a remote round trip before even querying the
// database. getClaims() verifies the access token's signature locally
// (WebCrypto + cached JWKS) and only falls back to a network call for
// legacy symmetric tokens, so the common path is now pure local work.
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const authProviderId = claims?.sub;
  if (!authProviderId) return null;

  const existing = await db.query.users.findFirst({ where: eq(users.authProviderId, authProviderId) });
  if (existing) return existing;

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
  return created;
});

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
