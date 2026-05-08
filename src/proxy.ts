/**
 * Proxy (antes "middleware") — sólo protege `/mis-proyectos` y subrutas.
 *
 * Renombrado de `src/middleware.ts` → `src/proxy.ts` para alinearse con
 * la convención de Next 16 (la convención `middleware` está deprecada
 * desde 16.x; ver https://nextjs.org/docs/messages/middleware-to-proxy).
 * Comportamiento idéntico al middleware previo.
 *
 * No toca `/diario/*`, `/`, `/sobre`, `/privacidad`, `/u/*`, ni `/api/*`.
 *
 * Estrategia (defense in depth):
 *   1) Aquí (edge runtime): sólo verificamos PRESENCIA de la cookie
 *      `maluwa_user`. No validamos firma ni vencimiento.
 *      Razón: la API de `node:crypto` (createHmac, timingSafeEqual)
 *      NO se ejecuta en edge runtime — falla con 500 en runtime
 *      aunque compile.
 *   2) En `/mis-proyectos/page.tsx` (Node runtime): `getUserFromCookie`
 *      verifica HMAC + vencimiento + hace SELECT a `maluwa.users`.
 *      Si la cookie es falsa/expirada/borrada, redirige a /login.
 *
 * Costo: si alguien forja una cookie con cualquier valor, llega al
 * server component (no a `/login`), y desde ahí lo redirige el page.
 * Es un round-trip extra, no una falla de seguridad — la página
 * nunca se renderiza con datos de un usuario no autenticado.
 */

import { NextResponse, type NextRequest } from "next/server";
// Importamos del módulo "edge-safe" (sin createHmac ni timingSafeEqual)
// para que el bundle de proxy no arrastre `node:crypto`.
import { COOKIE_NAME } from "@/lib/auth/cookie-name";

export const config = {
  matcher: ["/mis-proyectos/:path*"],
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
