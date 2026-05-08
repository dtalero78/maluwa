/**
 * Gating de la lección única del tronco común (`/leccion`).
 *
 * No tocamos schema: usamos una cookie httpOnly de larga vida —
 * `maluwa_lesson_seen`. Si el chico la borra, vuelve a ver la lección.
 * No es un guard del diario: es un paso opcional del onboarding.
 *
 * Patrón espejo de `session.ts` (mismo `secure: prod`, `sameSite: "lax"`,
 * `path: "/"`).
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "maluwa_lesson_seen";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año
const COOKIE_VALUE = "1";

export async function hasSeenLesson(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export async function markLessonSeen(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}
