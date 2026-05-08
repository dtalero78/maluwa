/**
 * Operaciones de DB para `maluwa.journals` y `maluwa.ai_usage`.
 *
 * Diseño v0:
 * - Las entradas del diario viven en una columna JSONB del journal. Es
 *   simple y suficiente mientras el feed no pase de unos cientos de
 *   elementos. Cuando crezca, se normaliza a una tabla aparte.
 * - El acceso es por `anon_token` (cookie httpOnly del estudiante) o
 *   por `user_id` cuando la cuenta exista.
 */

import { query } from "./index";
import type { DiaryEntry } from "@/lib/diario/types";

export interface JournalRow {
  id: string;
  anon_token: string;
  user_id: string | null;
  project_type: string;
  title: string | null;
  status: "draft" | "published" | "archived";
  published_url: string | null;
  entries_json: DiaryEntry[];
  created_at: string;
  updated_at: string;
  // Onboarding (Ley 1581 / MVP §2.1) — pueden venir null en journals
  // legacy creados antes de que existiera /empezar.
  student_name: string | null;
  student_age: number | null;
  student_city: string | null;
  student_school: string | null;
  parent_email: string | null;
  parent_name: string | null;
  consented_at: string | null;
  consent_version: string | null;
}

/**
 * Recupera o crea un journal para el `anon_token` dado. Si el chico ya
 * tiene una conversación, la devuelve; si no, crea un draft nuevo.
 */
export async function getOrCreateJournalByAnonToken(
  anonToken: string,
  initialEntries: DiaryEntry[],
): Promise<JournalRow> {
  // Prioridad: si hay un journal con user_id (ya publicado), úsalo.
  // Si no hay publicado, usa el draft más reciente. Sólo si no existe
  // ninguno se crea uno nuevo. Antes filtrábamos sólo por status='draft',
  // lo cual creaba un journal nuevo cada vez que el chico continuaba
  // editando después de publicar — y duplicaba la cuenta.
  const existing = await query<JournalRow>(
    `SELECT * FROM journals
     WHERE anon_token = $1
     ORDER BY (user_id IS NOT NULL) DESC, updated_at DESC
     LIMIT 1`,
    [anonToken],
  );
  if (existing.rows.length > 0) return existing.rows[0];

  const created = await query<JournalRow>(
    `INSERT INTO journals (anon_token, entries_json)
     VALUES ($1, $2::jsonb)
     RETURNING *`,
    [anonToken, JSON.stringify(initialEntries)],
  );
  return created.rows[0];
}

export async function getJournalById(id: string): Promise<JournalRow | null> {
  const r = await query<JournalRow>(`SELECT * FROM journals WHERE id = $1`, [
    id,
  ]);
  return r.rows[0] ?? null;
}

export async function updateJournalEntries(
  id: string,
  entries: DiaryEntry[],
): Promise<void> {
  await query(
    `UPDATE journals SET entries_json = $2::jsonb WHERE id = $1`,
    [id, JSON.stringify(entries)],
  );
}

/**
 * Persiste los datos del onboarding (Ley 1581 / MVP §2.1) sobre el journal
 * del `anonToken`. Si el journal ya existe, hace UPDATE; si no, INSERT con
 * `entries_json='[]'` (la página `/diario/[id]` stampa el opening del tutor
 * cuando encuentra entries vacío).
 *
 * Idempotente: dos submits del mismo onboarding sobre la misma cookie
 * actualizan la misma fila — no duplican.
 */
export interface OnboardingPayload {
  studentName: string;
  studentAge: number;
  studentCity: string;
  studentSchool: string | null;
  parentEmail: string | null;
  parentName: string | null;
  consentVersion: string; // 'v1'
}

export async function saveOnboardingForAnonToken(
  anonToken: string,
  data: OnboardingPayload,
): Promise<{ id: string; created: boolean }> {
  // UPDATE primero: priorizamos un journal con user_id (publicado) si
  // existe, sino el draft más reciente — mismo orden que
  // getOrCreateJournalByAnonToken para no pisar el journal "real" del chico.
  const updated = await query<{ id: string }>(
    `UPDATE journals
     SET student_name    = $2,
         student_age     = $3,
         student_city    = $4,
         student_school  = $5,
         parent_email    = $6,
         parent_name     = $7,
         consented_at    = now(),
         consent_version = $8
     WHERE id = (
       SELECT id FROM journals
       WHERE anon_token = $1
       ORDER BY (user_id IS NOT NULL) DESC, updated_at DESC
       LIMIT 1
     )
     RETURNING id`,
    [
      anonToken,
      data.studentName,
      data.studentAge,
      data.studentCity,
      data.studentSchool,
      data.parentEmail,
      data.parentName,
      data.consentVersion,
    ],
  );
  if (updated.rows.length > 0) {
    return { id: updated.rows[0].id, created: false };
  }

  const inserted = await query<{ id: string }>(
    `INSERT INTO journals (
       anon_token, entries_json,
       student_name, student_age, student_city, student_school,
       parent_email, parent_name, consented_at, consent_version
     )
     VALUES ($1, '[]'::jsonb, $2, $3, $4, $5, $6, $7, now(), $8)
     RETURNING id`,
    [
      anonToken,
      data.studentName,
      data.studentAge,
      data.studentCity,
      data.studentSchool,
      data.parentEmail,
      data.parentName,
      data.consentVersion,
    ],
  );
  return { id: inserted.rows[0].id, created: true };
}

/**
 * Registra una llamada a Claude para auditar costo.
 * Pricing aproximado de Claude Haiku 4.5 al 2026-04: $1/MTok input,
 * $5/MTok output. Se calcula en cents para precisión.
 */
const HAIKU_INPUT_PER_MTOK_USD = 1;
const HAIKU_OUTPUT_PER_MTOK_USD = 5;
const HAIKU_CACHE_READ_PER_MTOK_USD = 0.1;
const HAIKU_CACHE_WRITE_PER_MTOK_USD = 1.25;

export interface AiUsageInsert {
  journalId: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

/**
 * Cuántos turnos (llamadas a Claude) ha consumido este journal en las
 * últimas 24h. Sirve para enforzar el límite de 50 turnos/día/estudiante
 * que protege el riesgo #1 del MARCO (costo de IA descontrolado).
 */
export async function countTurnsLast24h(journalId: string): Promise<number> {
  const r = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ai_usage
     WHERE journal_id = $1 AND created_at > now() - interval '24 hours'`,
    [journalId],
  );
  return Number(r.rows[0]?.count ?? 0);
}

export async function recordAiUsage(u: AiUsageInsert): Promise<void> {
  const cents =
    100 *
    ((u.inputTokens * HAIKU_INPUT_PER_MTOK_USD) / 1_000_000 +
      (u.outputTokens * HAIKU_OUTPUT_PER_MTOK_USD) / 1_000_000 +
      (u.cacheReadTokens * HAIKU_CACHE_READ_PER_MTOK_USD) / 1_000_000 +
      (u.cacheWriteTokens * HAIKU_CACHE_WRITE_PER_MTOK_USD) / 1_000_000);
  await query(
    `INSERT INTO ai_usage
       (journal_id, model, input_tokens, output_tokens,
        cache_read_tokens, cache_write_tokens, cost_usd_cents)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      u.journalId,
      u.model,
      u.inputTokens,
      u.outputTokens,
      u.cacheReadTokens,
      u.cacheWriteTokens,
      cents,
    ],
  );
}
