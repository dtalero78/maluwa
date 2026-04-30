/**
 * POST /api/diario/upload-image
 *
 * Recibe un FormData con `file` (imagen). Sube a DO Spaces y devuelve la
 * URL pública. El cliente luego incluye esa URL en una entry de tipo
 * `answer` cuando manda el siguiente turno.
 *
 * Backend-proxy approach (no presigned URL): para v0 la simplicidad
 * vale más que ahorrar bandwidth del server. Cuando un colegio entero
 * suba al mismo tiempo se reconsidera.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { uploadImage, validateImage } from "@/lib/storage/spaces";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tope de tamaño request: 6 MB (deja margen sobre los 5 MB del archivo).
export const maxDuration = 30;

export async function POST(req: Request) {
  const anonToken = (await cookies()).get("maluwa_session")?.value;
  if (!anonToken) {
    return NextResponse.json(
      { ok: false, error: "no hay sesión activa" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "request inválido" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "falta el archivo" },
      { status: 400 },
    );
  }

  const v = validateImage({ mime: file.type, size: file.size });
  if (!v.ok) {
    return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  }

  // Resolver el journal del estudiante (para prefijar el key).
  let journalId: string | null = null;
  try {
    const r = await query<{ id: string }>(
      `SELECT id FROM journals
       WHERE anon_token = $1 AND status = 'draft'
       ORDER BY updated_at DESC LIMIT 1`,
      [anonToken],
    );
    journalId = r.rows[0]?.id ?? null;
  } catch (err) {
    console.error("[upload] journal lookup failed:", err);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const result = await uploadImage({
      buffer,
      mime: file.type,
      originalName: file.name,
      prefix: journalId ? `journals/${journalId}/` : "uploads/",
    });
    return NextResponse.json({
      ok: true,
      url: result.publicUrl,
      mime: result.mime,
      size: result.size,
    });
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json(
      { ok: false, error: "no se pudo subir la imagen" },
      { status: 500 },
    );
  }
}
