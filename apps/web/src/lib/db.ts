import { env } from "cloudflare:workers";
import { createDb, type Database } from "@nexus/db";

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = createDb(env.DB);
  }
  return db;
}
