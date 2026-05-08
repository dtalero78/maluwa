/**
 * POST /api/leccion/seen
 *
 * Marca la cookie httpOnly `maluwa_lesson_seen` para que futuras visitas
 * a `/leccion` redirijan directo al diario sin renderizar la lección.
 * Sin body, sin validación. Best-effort — el cliente sigue al diario
 * incluso si esto falla.
 */

import { NextResponse } from "next/server";
import { markLessonSeen } from "@/lib/diario/lesson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await markLessonSeen();
  return NextResponse.json({ ok: true });
}
