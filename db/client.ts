import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}

// prepare: false — required when connecting through Supabase's pgbouncer
// pooler (transaction mode doesn't support prepared statements), and
// harmless on a direct/session connection, so it's set unconditionally
// rather than branching on which connection string is in use.
const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle(queryClient, { schema });
