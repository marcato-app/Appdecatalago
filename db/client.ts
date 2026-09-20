import { cache } from "react";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// No caching across requests, on purpose — two reasons:
// 1. Next.js imports every route module during the build's "collect page
//    data" step just to inspect it, without ever calling anything on `db`.
//    DATABASE_URL is only available at runtime on Cloudflare (injected as a
//    Worker secret, not present at build time), so touching it at import
//    time broke the build.
// 2. On Cloudflare Workers, a socket (like a Postgres TCP connection)
//    belongs to the request that opened it — reusing one across requests in
//    the same isolate hangs instead of erroring, which is exactly what
//    happened when this used to cache a client at module scope.
//
// Within a single request, though, a connection absolutely should be
// reused — a page whose layout and page component (and whatever
// requireUser()/requireOwnedStore() each of them calls) all touch the
// database were each opening their own fresh connection, several full
// TCP+TLS handshakes to Supabase per page view, which was enough to trip
// Cloudflare's per-request resource limit on a page with a couple of
// queries. `cache()` from React scopes this factory to the current
// request/render — same connection for every query in that request, a
// brand-new one (and thus a brand-new socket, never shared with a past
// request) for the next. DATABASE_URL should still point at Supabase's
// transaction-mode pooler (port 6543, ?pgbouncer=true), which is built for
// short-lived connections like this.
const getDb = cache((): Db => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  // prepare: false — required when connecting through a pgbouncer pooler
  // (transaction mode doesn't support prepared statements), and harmless on
  // a direct/session connection, so it's set unconditionally.
  const queryClient = postgres(connectionString, { prepare: false, max: 1 });
  return drizzle(queryClient, { schema });
});

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
