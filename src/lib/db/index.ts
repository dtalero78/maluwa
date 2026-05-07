/**
 * Cliente Postgres compartido entre todas las API routes.
 *
 * - Pool de conexiones (singleton) reutilizado entre invocaciones de Next.
 * - SSL con `rejectUnauthorized: false` porque DigitalOcean usa cert
 *   auto-firmado en su CA (alternativa: descargar el ca-cert y pasarlo).
 * - search_path = maluwa,public para que las queries puedan referirse a
 *   las tablas sin prefijo (`SELECT * FROM journals` en vez de
 *   `SELECT * FROM maluwa.journals`).
 */

import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  // En dev, Next/Turbopack recompila y crea múltiples instancias del
  // módulo. Cacheamos el pool en globalThis para evitar agotar conexiones.
  var __maluwa_pg_pool: Pool | undefined;
}

function buildPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Set it in .env.local (dev) and as a SECRET in DO App Platform (prod).",
    );
  }
  // Parseamos manualmente para poder sobreescribir SSL (DO usa cert
  // auto-firmado y `pg-connection-string` v9 lo rechaza por default).
  const u = new URL(url);
  return new Pool({
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    database: u.pathname.replace(/^\//, ""),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

export function getPool(): Pool {
  if (!globalThis.__maluwa_pg_pool) {
    const pool = buildPool();
    pool.on("connect", (client) => {
      // Cualquier conexión que el pool entregue ya tiene el search_path
      // listo, así no hay que repetirlo en cada query.
      void client.query("SET search_path TO maluwa, public");
    });
    pool.on("error", (err) => {
      console.error("[db] pool error:", err);
    });
    globalThis.__maluwa_pg_pool = pool;
  }
  return globalThis.__maluwa_pg_pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params as unknown[]);
}
