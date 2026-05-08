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
  verifyPassword,
  getPublishedPageByUser,
  updatePublishedPageById,
} from "@/lib/db/users";
import { setUserCookie } from "@/lib/auth/session";
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
  // Datos del onboarding — null en journals legacy.
  student_name: string | null;
  student_age: number | null;
  student_city: string | null;
  student_school: string | null;
  parent_email: string | null;
  parent_name: string | null;
  consented_at: string | null;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as PublishBody;

  const anonToken = (await cookies()).get("maluwa_session")?.value;
  if (!anonToken) return bad("no encontramos tu diario, recarga la página");

  // Buscar TODOS los journals del cookie (puede haber duplicados de
  // sesiones que crearon nuevos journals tras publicar). Prioridad para
  // el que tenga user_id (ya publicado); si hay drafts más recientes,
  // sus entries son la fuente de verdad para el HTML.
  //
  // Defensa contra deploys parciales: si las columnas del onboarding
  // todavía no existen en la DB (migración 0002_onboarding pendiente de
  // aplicar), el SELECT extendido falla con 42703 ("undefined column").
  // En ese caso reintentamos con el SELECT legacy (sin las columnas) y
  // tratamos el journal como pre-onboarding — el flujo viejo sigue 100%
  // operativo. Cuando el operador aplique la migración, el primer SELECT
  // empieza a funcionar y volvemos al flujo nuevo sin redeploy.
  const allRes = await selectJournalsByAnonToken(anonToken);
  if (allRes.rows.length === 0) return bad("no encontramos tu diario");

  // Journal "principal" = el claimado si existe, sino el más reciente.
  const claimed = allRes.rows.find((r) => r.user_id);
  const mostRecent = allRes.rows[0];
  const journal: JournalRow = claimed
    ? { ...claimed, entries_json: mostRecent.entries_json }
    : mostRecent;

  // Si hay journal claimado pero los entries más recientes están en otro
  // journal, mergear hacia el claimado y limpiar los huérfanos.
  if (claimed && claimed.id !== mostRecent.id) {
    await query(
      `UPDATE journals SET entries_json = $2 WHERE id = $1`,
      [claimed.id, JSON.stringify(mostRecent.entries_json)],
    );
    await query(
      `DELETE FROM journals WHERE anon_token = $1 AND id <> $2`,
      [anonToken, claimed.id],
    );
  }

  // Snapshot a publicar = el último del feed.
  const lastSnapshot = [...journal.entries_json]
    .reverse()
    .find((e): e is SnapshotEntry => e.kind === "snapshot");
  if (!lastSnapshot) {
    return bad("aún no tienes una página construida; conversa un poco más");
  }
  const title = lastSnapshot.caption?.slice(0, 80) ?? null;

  // FLUJO 2 — re-publicación. La fuente de verdad es user_id (no
  // journal_id) porque el journal asociado a la published_page puede
  // haberse perdido en consolidaciones previas.
  if (journal.user_id) {
    const page = await getPublishedPageByUser(journal.user_id);
    if (page) {
      await updatePublishedPageById({
        id: page.id,
        title,
        html: lastSnapshot.html,
        css: lastSnapshot.css,
      });
      // Re-asociar el journal a la página por si estaba desincronizado.
      await claimJournalForUser(
        journal.id,
        journal.user_id,
        `/u/${page.slug}`,
        title,
      );
      // Re-emitir cookie de sesión por si no la tenía (p.ej. usuario que
      // publicó antes de que existiera este feature, o que la perdió).
      await setUserCookie(journal.user_id);
      return NextResponse.json({
        ok: true,
        url: `/u/${page.slug}`,
        fullUrl: `https://maluwa.app/u/${page.slug}`,
        reused: true,
      });
    }
    // Edge raro: user existe pero no tiene página. Caemos a flujo 1 con
    // ese mismo user (debe enviar slug en el body). No hace falta crear
    // user de nuevo — abajo el flujo "email existe + password" lo maneja.
    console.warn(
      `[publicar] journal ${journal.id} con user_id ${journal.user_id} pero sin página, pidiendo slug nuevo`,
    );
  }

  // FLUJO 1 — primera publicación.
  //
  // Si el journal pasó por el onboarding (`/empezar`), reusamos los datos
  // capturados (nombre, edad, ciudad, colegio, email del acudiente) y el
  // consentimiento ya quedó marcado en `consented_at`. El modal de
  // publicar solo necesita email + password + slug. Si NO pasó (legacy:
  // chico que tenía cookie de antes del onboarding), exigimos el form
  // completo como antes.
  const hasOnboarding =
    !!journal.student_name &&
    typeof journal.student_age === "number" &&
    !!journal.consented_at;

  const errors: string[] = [];
  if (!body.email || !EMAIL_RE.test(body.email)) errors.push("email invalido");
  if (!body.password || body.password.length < 6)
    errors.push("password muy corto (mínimo 6)");
  if (!body.slug || !SLUG_RE.test(body.slug))
    errors.push("slug invalido (solo letras minúsculas, números y guiones)");

  if (!hasOnboarding) {
    if (!body.parent_email || !EMAIL_RE.test(body.parent_email))
      errors.push("email del padre/tutor invalido");
    if (typeof body.age !== "number" || body.age < 8 || body.age > 25)
      errors.push("edad fuera de rango");
    if (body.accepted_terms !== true) errors.push("debes aceptar los términos");
  }
  if (errors.length) return bad(errors.join(", "));

  // Datos efectivos del estudiante: si hay onboarding, los del journal
  // mandan sobre los del body (el chico no los va a re-tipear). Si no,
  // los del body como antes.
  const effStudentName = hasOnboarding ? journal.student_name : body.name ?? null;
  const effAge = hasOnboarding ? journal.student_age : body.age;
  const effCity = hasOnboarding ? journal.student_city : body.city ?? null;
  const effSchool = hasOnboarding ? journal.student_school : body.school ?? null;
  const effParentEmail = hasOnboarding
    ? journal.parent_email
    : body.parent_email ?? null;

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
      await setUserCookie(verified.id);
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
    await setUserCookie(verified.id);
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
    name: effStudentName ?? undefined,
    age: typeof effAge === "number" ? effAge : undefined,
    city: effCity ?? undefined,
    school: effSchool ?? undefined,
    parentEmail: effParentEmail ?? undefined,
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
  await setUserCookie(user.id);

  // Aviso al padre — best-effort. Si el chico (onboarding, edad >=14) no
  // dio email del acudiente, simplemente no se manda nada y no se
  // registra el intento (no hay nada que auditar).
  const fullUrl = `https://maluwa.app${publishedUrl}`;
  if (effParentEmail) {
    try {
      const result = await notifyParent({
        parentEmail: effParentEmail,
        studentName: effStudentName,
        studentEmail: email,
        publicUrl: fullUrl,
      });
      await recordNotification({
        userId: user.id,
        kind: "parent_publish_notice",
        toEmail: effParentEmail,
        subject: result.subject,
        ok: result.ok,
        reason: result.reason,
        providerId: result.providerId,
      });
    } catch (err) {
      console.error("[publicar] notify+record threw:", err);
    }
  }

  return NextResponse.json({ ok: true, url: publishedUrl, fullUrl });
}

function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

/**
 * SELECT defensivo: intenta traer las columnas del onboarding y, si no
 * existen aún en la DB (migración 0002 pendiente), cae al SELECT legacy
 * y rellena los campos nuevos con null. De esa forma el endpoint nunca
 * devuelve 500 por un schema desactualizado: simplemente trata al
 * journal como legacy hasta que el DBA corra `npm run db:migrate:onboarding`.
 *
 * Cacheamos la decisión en memoria del proceso (`onboardingCols`) para
 * no pagar el `try/catch` ni un round-trip extra por cada request.
 */
let onboardingCols: boolean | null = null;

interface JournalRowDb {
  id: string;
  user_id: string | null;
  status: string;
  published_url: string | null;
  entries_json: DiaryEntry[];
  student_name?: string | null;
  student_age?: number | null;
  student_city?: string | null;
  student_school?: string | null;
  parent_email?: string | null;
  parent_name?: string | null;
  consented_at?: string | null;
  updated_at: string;
}

async function selectJournalsByAnonToken(
  anonToken: string,
): Promise<{ rows: JournalRow[] }> {
  const SELECT_NEW = `SELECT id, user_id, status, published_url, entries_json,
            student_name, student_age, student_city, student_school,
            parent_email, parent_name, consented_at, updated_at
     FROM journals WHERE anon_token = $1
     ORDER BY updated_at DESC`;
  const SELECT_LEGACY = `SELECT id, user_id, status, published_url, entries_json, updated_at
     FROM journals WHERE anon_token = $1
     ORDER BY updated_at DESC`;

  // Si ya sabemos que las columnas no existen, ahorramos el round-trip.
  if (onboardingCols === false) {
    const res = await query<JournalRowDb>(SELECT_LEGACY, [anonToken]);
    return { rows: res.rows.map(toJournalRow) };
  }
  try {
    const res = await query<JournalRowDb>(SELECT_NEW, [anonToken]);
    onboardingCols = true;
    return { rows: res.rows.map(toJournalRow) };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "42703") {
      // Columnas faltantes — migración 0002_onboarding sin aplicar.
      onboardingCols = false;
      console.warn(
        "[publicar] onboarding columns missing on maluwa.journals; falling back to legacy SELECT. Run `npm run db:migrate:onboarding`.",
      );
      const res = await query<JournalRowDb>(SELECT_LEGACY, [anonToken]);
      return { rows: res.rows.map(toJournalRow) };
    }
    throw err;
  }
}

function toJournalRow(r: JournalRowDb): JournalRow {
  return {
    id: r.id,
    user_id: r.user_id,
    status: r.status,
    published_url: r.published_url,
    entries_json: r.entries_json,
    student_name: r.student_name ?? null,
    student_age: r.student_age ?? null,
    student_city: r.student_city ?? null,
    student_school: r.student_school ?? null,
    parent_email: r.parent_email ?? null,
    parent_name: r.parent_name ?? null,
    consented_at: r.consented_at ?? null,
  };
}
