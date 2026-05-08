/**
 * POST /api/auth/logout
 *
 * Limpia la cookie `maluwa_user` del browser actual. Idempotente.
 * No revoca el token en DB (no hay tabla de sessions); cualquier copia
 * del token sigue siendo válida hasta `expiresAt`.
 */

import { NextResponse } from "next/server";
import { clearUserCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearUserCookie();
  return NextResponse.json({ ok: true });
}
