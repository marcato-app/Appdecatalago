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
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  const existing = await db.query.users.findFirst({ where: eq(users.authProviderId, authUser.id) });
  if (existing) return existing;

  // First time we see this Supabase auth user (normally created already by
  // the signup action — this is just a safety net, e.g. for a future OAuth
  // provider that skips our own signup form).
  const [created] = await db
    .insert(users)
    .values({
      email: authUser.email,
      authProviderId: authUser.id,
      name: typeof authUser.user_metadata?.name === "string" ? authUser.user_metadata.name : null,
    })
    .returning();
  return created;
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
