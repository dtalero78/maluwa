/**
 * Sesión anónima del estudiante: cookie httpOnly con un token aleatorio
 * que asocia su navegador con un journal en DB. Sin login.
 *
 * Cuando publique su proyecto, ese token se "claima" creando un user
 * y vinculándolo al journal — pero ese flujo viene después.
 */

import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

const COOKIE_NAME = "maluwa_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export async function getOrCreateAnonToken(): Promise<{
  token: string;
  isNew: boolean;
}> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) return { token: existing, isNew: false };

  const token = randomBytes(24).toString("base64url");
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return { token, isNew: true };
}
