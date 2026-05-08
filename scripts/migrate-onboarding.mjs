#!/usr/bin/env node
/**
 * Aplica SOLO `migrations/0002_onboarding.sql` al cluster Postgres
 * apuntado por DATABASE_URL. Pensado para entornos donde el usuario de
 * conexión NO es superuser y por lo tanto `npm run db:migrate` (que
 * intenta `CREATE EXTENSION pgcrypto` desde `schema.sql`) explota con
 * `permission denied for database`.
 *
 * Idempotente: las 8 columnas usan `ADD COLUMN IF NOT EXISTS`. Verifica
 * post-aplicación que todas existen y reporta cuáles son nuevas vs.
 * preexistentes.
 *
 * Uso: `npm run db:migrate:onboarding`.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

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

const sqlPath = resolve(root, "migrations/0002_onboarding.sql");
const sql = readFileSync(sqlPath, "utf-8");

const NEW_COLS = [
  "student_name",
  "student_age",
  "student_city",
  "student_school",
  "parent_email",
  "parent_name",
  "consented_at",
  "consent_version",
];

console.log(`[migrate:onboarding] connecting to ${u.hostname}/${u.pathname.slice(1)}`);
await client.connect();

// Snapshot pre — para reportar qué columnas eran nuevas.
const before = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema='maluwa' AND table_name='journals'
     AND column_name = ANY($1::text[])`,
  [NEW_COLS],
);
const beforeSet = new Set(before.rows.map((r) => r.column_name));

console.log(`[migrate:onboarding] applying ${sqlPath}`);
try {
  await client.query(sql);
} catch (err) {
  console.error(`[migrate:onboarding] failed: ${err.message}`);
  if (err.code === "42501") {
    console.error(
      "[migrate:onboarding] hint: el usuario actual no es owner de maluwa.journals.\n" +
        "  Pedile al DBA que corra el archivo con un usuario con privilegios:\n" +
        "    psql \"$DATABASE_URL\" -f migrations/0002_onboarding.sql\n" +
        "  o que ejecute `ALTER TABLE maluwa.journals OWNER TO <usuario_actual>`.",
    );
  }
  await client.end();
  process.exit(1);
}

// Snapshot post — verifica que las 8 estén.
const after = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema='maluwa' AND table_name='journals'
     AND column_name = ANY($1::text[])
   ORDER BY column_name`,
  [NEW_COLS],
);
const afterSet = new Set(after.rows.map((r) => r.column_name));
const missing = NEW_COLS.filter((c) => !afterSet.has(c));
const created = NEW_COLS.filter((c) => afterSet.has(c) && !beforeSet.has(c));
const preexisting = NEW_COLS.filter((c) => beforeSet.has(c));

if (missing.length) {
  console.error(`[migrate:onboarding] columnas FALTANTES tras aplicar: ${missing.join(", ")}`);
  await client.end();
  process.exit(1);
}

console.log(
  `[migrate:onboarding] ok — ${NEW_COLS.length}/8 columnas presentes en maluwa.journals`,
);
if (created.length) console.log(`[migrate:onboarding]   nuevas: ${created.join(", ")}`);
if (preexisting.length)
  console.log(`[migrate:onboarding]   ya existían: ${preexisting.join(", ")}`);

await client.end();
