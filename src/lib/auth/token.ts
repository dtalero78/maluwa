/**
 * Token helpers — puramente computacionales (HMAC + base64url). Sin
 * imports a Postgres ni a `next/headers`, así que este módulo es
 * seguro en edge runtime (middleware) además de en Node.
 *
 * Token format: `<userId>.<expiresAtUnix>.<sigBase64Url>`
 * sig = HMAC-SHA256(AUTH_SECRET, "<userId>|<expiresAtUnix>"),
 * truncado a 32 bytes y codificado en base64url.
 *
 * Edge runtime de Next 15+/16 soporta `createHmac` y `timingSafeEqual`
 * desde `node:crypto`, así que este módulo funciona en middleware sin
 * cambios.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME } from "./cookie-name";

export { COOKIE_NAME };
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const SIG_BYTES = 32;

/**
 * Lazy lookup. NO se evalúa en module load — eso rompe `next build`
 * cuando AUTH_SECRET no está. Sólo en sign/verify.
 */
export function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error(
      "AUTH_SECRET no definido — agrégalo a .env.local (`openssl rand -base64 32`)",
    );
  }
  return secret;
}

function hmac(secret: string, payload: string): Buffer {
  return createHmac("sha256", secret)
    .update(payload)
    .digest()
    .subarray(0, SIG_BYTES);
}

export function signUserToken(userId: string): {
  token: string;
  expiresAt: number;
} {
  const secret = requireAuthSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
  const sig = hmac(secret, `${userId}|${expiresAt}`).toString("base64url");
  return { token: `${userId}.${expiresAt}.${sig}`, expiresAt };
}

export function verifyUserToken(token: string): { userId: string } | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresAtStr, sigB64] = parts;
  if (!userId || !expiresAtStr || !sigB64) return null;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000))
    return null;

  let secret: string;
  try {
    secret = requireAuthSecret();
  } catch {
    // Sin secret no podemos verificar nada. Devolvemos null para que el
    // middleware/server redirija sin throw.
    return null;
  }

  const expected = hmac(secret, `${userId}|${expiresAt}`);
  let provided: Buffer;
  try {
    provided = Buffer.from(sigB64, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  return { userId };
}
