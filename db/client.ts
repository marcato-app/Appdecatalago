import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | undefined;

// Lazy on purpose: Next.js imports every route module during the build's
// "collect page data" step just to inspect it, without ever calling
// anything on `db`. DATABASE_URL is only available at runtime on
// Cloudflare (injected as a Worker secret, not present at build time), so
// throwing eagerly at import time broke the build. A Proxy defers the
// env check and the actual connection to the first real property access.
function getDb(): Db {
  if (!cached) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
    }
    // prepare: false — required when connecting through Supabase's
    // pgbouncer pooler (transaction mode doesn't support prepared
    // statements), and harmless on a direct/session connection, so it's
    // set unconditionally rather than branching on the connection string.
    const queryClient = postgres(connectionString, { prepare: false });
    cached = drizzle(queryClient, { schema });
  }
  return cached;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
