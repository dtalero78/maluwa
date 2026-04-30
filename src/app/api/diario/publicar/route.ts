/**
 * POST /api/diario/publicar
 *
 * Publica el journal del estudiante: crea cuenta + asocia journal +
 * guarda HTML/CSS final en `published_pages`. Devuelve la URL.
 *
 * Body esperado:
 * {
 *   email: string,
 *   password: string (min 6),
 *   slug: string ("panaderia-de-mi-mama"),
 *   age: number,
 *   parent_email: string,
 *   accepted_terms: true,
 *   name?: string,
 *   city?: string,
 *   school?: string
 * }
 *
 * Auth: la cookie `maluwa_session` identifica el journal del chico.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import {
  createUser,
  getUserByEmail,
  isSlugTaken,
  insertPublishedPage,
  claimJournalForUser,
} from "@/lib/db/users";
import type { DiaryEntry, SnapshotEntry } from "@/lib/diario/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PublishBody {
  email?: string;
  password?: string;
  slug?: string;
  age?: number;
  parent_email?: string;
  accepted_terms?: boolean;
  name?: string;
  city?: string;
  school?: string;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as PublishBody | null;
  if (!body) return bad("body invalido");

  const errors: string[] = [];
  if (!body.email || !EMAIL_RE.test(body.email)) errors.push("email invalido");
  if (!body.password || body.password.length < 6)
    errors.push("password muy corto (mínimo 6)");
  if (!body.slug || !SLUG_RE.test(body.slug))
    errors.push("slug invalido (solo letras minúsculas, números y guiones)");
  if (!body.parent_email || !EMAIL_RE.test(body.parent_email))
    errors.push("email del padre/tutor invalido");
  if (typeof body.age !== "number" || body.age < 8 || body.age > 25)
    errors.push("edad fuera de rango");
  if (body.accepted_terms !== true)
    errors.push("debes aceptar los términos");
  if (errors.length) return bad(errors.join(", "));

  const email = body.email!;
  const slug = body.slug!;

  // 1) Slug debe estar libre.
  if (await isSlugTaken(slug)) {
    return bad(`el slug "${slug}" ya está tomado, prueba otro`);
  }
  // 2) Email no debe existir aún (en v0 no permitimos publicar a una cuenta existente).
  if (await getUserByEmail(email)) {
    return bad("ese email ya tiene cuenta");
  }

  // 3) Encontrar el journal del estudiante por su cookie.
  const anonToken = (await cookies()).get("maluwa_session")?.value;
  if (!anonToken) return bad("no encontramos tu diario, recarga la página");

  const journalRes = await query<{ id: string; entries_json: DiaryEntry[] }>(
    `SELECT id, entries_json FROM journals
     WHERE anon_token = $1 AND status = 'draft'
     ORDER BY updated_at DESC LIMIT 1`,
    [anonToken],
  );
  const journal = journalRes.rows[0];
  if (!journal) return bad("no encontramos tu diario en draft");

  // 4) Sacar el último snapshot del feed (es lo que se publicará).
  const lastSnapshot = [...journal.entries_json]
    .reverse()
    .find((e): e is SnapshotEntry => e.kind === "snapshot");
  if (!lastSnapshot) {
    return bad("aún no tienes una página construida; conversa un poco más");
  }

  // 5) Crear user.
  const user = await createUser({
    email,
    password: body.password!,
    name: body.name,
    age: body.age,
    city: body.city,
    school: body.school,
    parentEmail: body.parent_email,
  });

  // 6) Insertar published_page.
  const publishedUrl = `/u/${slug}`;
  const title = lastSnapshot.caption?.slice(0, 80) ?? null;
  await insertPublishedPage({
    slug,
    journalId: journal.id,
    userId: user.id,
    title,
    html: lastSnapshot.html,
    css: lastSnapshot.css,
  });

  // 7) Asociar journal al user, marcar publicado.
  await claimJournalForUser(journal.id, user.id, publishedUrl, title);

  return NextResponse.json({
    ok: true,
    url: publishedUrl,
    fullUrl: `https://maluwa.app${publishedUrl}`,
  });
}

function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}
