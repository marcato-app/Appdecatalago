import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS, decodeSessionToken, encodeSessionToken } from "./token";

// Local session implementation used before a real Supabase project is
// connected (see ARCHITECTURE.md "Auth"). Every call site only ever talks to
// getCurrentUser()/requireUser(), so swapping this module for Supabase Auth
// later doesn't touch dashboard pages/actions.

export async function createSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSessionToken(userId, expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSessionToken(token)?.userId ?? null;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return (await db.query.users.findFirst({ where: eq(users.id, userId) })) ?? null;
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
