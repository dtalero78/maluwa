/**
 * Sesión del USUARIO autenticado — separada de la cookie anónima del
 * diario (`maluwa_session`). Los dos pueden coexistir en el browser.
 *
 * Este módulo importa `@/lib/db/users` (Postgres), así que es Node-only
 * (no se puede importar desde middleware). Para verificación pura
 * (sin DB lookup) usar `@/lib/auth/token`.
 *
 * Sin tabla de sessions en DB — el HMAC es la única autoridad. Logout
 * limpia la cookie del browser; no revoca tokens emitidos.
 */

import { cookies } from "next/headers";
import { getUserById, type UserRow } from "@/lib/db/users";
import {
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  signUserToken,
  verifyUserToken,
} from "./token";

// Re-export para que el resto del código siga importando desde un
// único punto si así lo prefiere.
export {
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  signUserToken,
  verifyUserToken,
} from "./token";

/** Setea la cookie `maluwa_user` httpOnly con un token recién firmado.
 *  Llamar después de cualquier flujo que haya autenticado/creado al
 *  user (login, signup vía /api/diario/publicar, claim-by-existing). */
export async function setUserCookie(userId: string): Promise<void> {
  const { token } = signUserToken(userId);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Logout — limpia la cookie del browser actual. Idempotente. */
export async function clearUserCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Verifica la cookie y, si pasa, hace SELECT a `maluwa.users` por id.
 * Retorna null en cualquier caso de fallo (cookie ausente, inválida,
 * expirada, user borrado). Sin throw.
 */
export async function getUserFromCookie(): Promise<UserRow | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const v = verifyUserToken(raw);
  if (!v) return null;
  try {
    return await getUserById(v.userId);
  } catch (err) {
    console.error("[auth/session] getUserById falló:", err);
    return null;
  }
}
