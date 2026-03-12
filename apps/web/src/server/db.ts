import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";

/**
 * Get a Drizzle ORM instance connected to the D1 database.
 * Uses the `env.DB` binding from Cloudflare Workers.
 *
 * This should only be called from server functions (createServerFn).
 *
 * @example
 * ```ts
 * const getUsers = createServerFn({ method: "GET" }).handler(async () => {
 *   const db = getDb();
 *   return db.select().from(schema.users);
 * });
 * ```
 */
export function getDb() {
  return drizzle(env.DB, { schema });
}

// Re-export schema for convenience
export { schema };

// Export the database type for use in other files
export type Database = ReturnType<typeof getDb>;
