#!/usr/bin/env node
/**
 * Aplica src/lib/db/schema.sql al cluster Postgres apuntado por
 * DATABASE_URL. Idempotente. Llamar con `npm run db:migrate`.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// Carga .env.local si existe (en dev).
config({ path: resolve(root, ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is missing. Set it in .env.local or in your shell env.",
  );
  process.exit(1);
}

const u = new URL(url);
const client = new pg.Client({
  host: u.hostname,
  port: u.port ? Number(u.port) : 5432,
  database: u.pathname.replace(/^\//, ""),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  ssl: { rejectUnauthorized: false },
});

const sqlPath = resolve(root, "src/lib/db/schema.sql");
const sql = readFileSync(sqlPath, "utf-8");

console.log(`[migrate] connecting to ${u.hostname}/${u.pathname.slice(1)}`);
await client.connect();
console.log(`[migrate] applying ${sqlPath}`);
await client.query(sql);
console.log("[migrate] done");
const rows = await client.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'maluwa' ORDER BY 1`,
);
console.log("[migrate] tables in maluwa:", rows.rows.map((r) => r.table_name).join(", "));
await client.end();
