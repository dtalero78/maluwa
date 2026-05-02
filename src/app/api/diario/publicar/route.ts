/**
 * POST /api/diario/publicar
 *
 * Dos flujos:
 *
 * 1. PRIMERA publicación (journal todavía no tiene user_id):
 *    - Body con email, password, slug, edad, parent_email, accepted_terms.
 *    - Crea cuenta + claima journal + inserta published_page + avisa al
 *      padre por email.
 *
 * 2. RE-publicación (journal ya tiene user_id):
 *    - Body puede ir vacío. La cookie identifica al estudiante.
 *    - Sobreescribe el HTML/CSS/title de la página existente con el
 *      último snapshot. Mantiene el mismo slug. NO se manda email
 *      otra vez (el padre ya fue avisado).
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
  recordNotification,
  updatePublishedPageByJournal,
  verifyPassword,
  getPublishedPageByUser,
  updatePublishedPageById,
} from "@/lib/db/users";
import { notifyParent } from "@/lib/email/notify-parent";
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

interface JournalRow {
  id: string;
  user_id: string | null;
  status: string;
  published_url: string | null;
  entries_json: DiaryEntry[];
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as PublishBody;

  const anonToken = (await cookies()).get("maluwa_session")?.value;
  if (!anonToken) return bad("no encontramos tu diario, recarga la página");

  // Buscar el journal de este estudiante. Lo aceptamos en cualquier
  // estado (draft o published) — si está published, sobreescribimos.
  const journalRes = await query<JournalRow>(
    `SELECT id, user_id, status, published_url, entries_json
     FROM journals WHERE anon_token = $1
     ORDER BY updated_at DESC LIMIT 1`,
    [anonToken],
  );
  const journal = journalRes.rows[0];
  if (!journal) return bad("no encontramos tu diario");

  // Snapshot a publicar = el último del feed.
  const lastSnapshot = [...journal.entries_json]
    .reverse()
    .find((e): e is SnapshotEntry => e.kind === "snapshot");
  if (!lastSnapshot) {
    return bad("aún no tienes una página construida; conversa un poco más");
  }
  const title = lastSnapshot.caption?.slice(0, 80) ?? null;

  // FLUJO 2 — re-publicación.
  if (journal.user_id) {
    const updated = await updatePublishedPageByJournal({
      journalId: journal.id,
      title,
      html: lastSnapshot.html,
      css: lastSnapshot.css,
    });
    if (!updated) {
      // Edge case: tiene user_id pero no encuentro published_page.
      // Probablemente la borraron a mano. Caemos a flujo 1 NO es seguro
      // (faltarían datos). Devolvemos error y log para investigar.
      console.error(
        `[publicar] journal ${journal.id} tiene user_id pero no published_page`,
      );
      return bad("hay un problema con tu cuenta, escríbenos a hola@maluwa.app");
    }
    return NextResponse.json({
      ok: true,
      url: `/u/${updated.slug}`,
      fullUrl: `https://maluwa.app/u/${updated.slug}`,
      reused: true,
    });
  }

  // FLUJO 1 — primera publicación. Validar todo el formulario.
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
  if (body.accepted_terms !== true) errors.push("debes aceptar los términos");
  if (errors.length) return bad(errors.join(", "));

  const email = body.email!.toLowerCase().trim();
  const slug = body.slug!;

  // Caso A: email ya tiene cuenta — autenticamos y reusamos su página
  // (manteniendo el slug original). Esto pasa si el chico borró cookies,
  // o si su journal anterior se quedó sin claimar por algún error.
  const existing = await getUserByEmail(email);
  if (existing) {
    const verified = await verifyPassword(email, body.password!);
    if (!verified) {
      return bad(
        "ese email ya tiene cuenta. el password no coincide — prueba con la contraseña que pusiste la primera vez.",
      );
    }
    const page = await getPublishedPageByUser(verified.id);
    if (page) {
      // Reusamos slug existente y sobreescribimos.
      await updatePublishedPageById({
        id: page.id,
        title,
        html: lastSnapshot.html,
        css: lastSnapshot.css,
      });
      await claimJournalForUser(
        journal.id,
        verified.id,
        `/u/${page.slug}`,
        title,
      );
      return NextResponse.json({
        ok: true,
        url: `/u/${page.slug}`,
        fullUrl: `https://maluwa.app/u/${page.slug}`,
        reused: true,
      });
    }
    // Edge: user existe pero nunca publicó. Tratar como primera publicación
    // bajo esta cuenta — slug debe estar libre.
    if (await isSlugTaken(slug))
      return bad(`el slug "${slug}" ya está tomado, prueba otro`);
    const publishedUrl = `/u/${slug}`;
    await insertPublishedPage({
      slug,
      journalId: journal.id,
      userId: verified.id,
      title,
      html: lastSnapshot.html,
      css: lastSnapshot.css,
    });
    await claimJournalForUser(journal.id, verified.id, publishedUrl, title);
    return NextResponse.json({
      ok: true,
      url: publishedUrl,
      fullUrl: `https://maluwa.app${publishedUrl}`,
    });
  }

  // Caso B: email nuevo — flujo normal de "primera vez".
  if (await isSlugTaken(slug))
    return bad(`el slug "${slug}" ya está tomado, prueba otro`);

  const user = await createUser({
    email,
    password: body.password!,
    name: body.name,
    age: body.age,
    city: body.city,
    school: body.school,
    parentEmail: body.parent_email,
  });

  const publishedUrl = `/u/${slug}`;
  await insertPublishedPage({
    slug,
    journalId: journal.id,
    userId: user.id,
    title,
    html: lastSnapshot.html,
    css: lastSnapshot.css,
  });
  await claimJournalForUser(journal.id, user.id, publishedUrl, title);

  // Aviso al padre — best-effort.
  const fullUrl = `https://maluwa.app${publishedUrl}`;
  try {
    const result = await notifyParent({
      parentEmail: body.parent_email!,
      studentName: body.name ?? null,
      studentEmail: email,
      publicUrl: fullUrl,
    });
    await recordNotification({
      userId: user.id,
      kind: "parent_publish_notice",
      toEmail: body.parent_email!,
      subject: result.subject,
      ok: result.ok,
      reason: result.reason,
      providerId: result.providerId,
    });
  } catch (err) {
    console.error("[publicar] notify+record threw:", err);
  }

  return NextResponse.json({ ok: true, url: publishedUrl, fullUrl });
}

function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}
