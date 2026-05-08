/**
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 * Setea la cookie `maluwa_user` si las credenciales coinciden.
 * No crea cuentas — el signup vive en `/api/diario/publicar`.
 */

import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/db/users";
import { setUserCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

const INVALID_MSG = "email o contraseña no coinciden";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as LoginBody;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: INVALID_MSG },
      { status: 401 },
    );
  }

  const user = await verifyPassword(email, password);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: INVALID_MSG },
      { status: 401 },
    );
  }

  await setUserCookie(user.id);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
