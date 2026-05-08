/**
 * Operaciones de DB para `maluwa.users` y `maluwa.published_pages`.
 *
 * Auth simple: email + password. Hashea con bcrypt.
 */

import bcrypt from "bcryptjs";
import { query } from "./index";

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  city: string | null;
  school: string | null;
  parent_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  age?: number;
  city?: string;
  school?: string;
  parentEmail?: string;
}

export async function createUser(input: CreateUserInput): Promise<UserRow> {
  const hash = await bcrypt.hash(input.password, 10);
  const r = await query<UserRow>(
    `INSERT INTO users (email, password_hash, name, age, city, school, parent_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, name, age, city, school, parent_email,
               created_at, updated_at`,
    [
      input.email.toLowerCase().trim(),
      hash,
      input.name ?? null,
      input.age ?? null,
      input.city ?? null,
      input.school ?? null,
      input.parentEmail?.toLowerCase().trim() ?? null,
    ],
  );
  return r.rows[0];
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const r = await query<UserRow>(
    `SELECT id, email, name, age, city, school, parent_email,
            created_at, updated_at
     FROM users WHERE email = $1`,
    [email.toLowerCase().trim()],
  );
  return r.rows[0] ?? null;
}

/**
 * Devuelve el user si email + password coinciden, null si no. Usa el
 * password_hash en DB; el hash nunca sale a fuera de esta función.
 */
export async function verifyPassword(
  email: string,
  password: string,
): Promise<UserRow | null> {
  const r = await query<UserRow & { password_hash: string }>(
    `SELECT id, email, name, age, city, school, parent_email,
            created_at, updated_at, password_hash
     FROM users WHERE email = $1`,
    [email.toLowerCase().trim()],
  );
  const row = r.rows[0];
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return null;
  // Quitar el hash antes de devolver.
  const { password_hash: _, ...rest } = row;
  void _;
  return rest;
}

/**
 * "Claima" un journal anónimo asociándolo a un user que acaba de crearse.
 * Cambia status a 'published' y guarda la URL pública.
 */
export async function claimJournalForUser(
  journalId: string,
  userId: string,
  publishedUrl: string,
  title: string | null,
): Promise<void> {
  await query(
    `UPDATE journals
     SET user_id = $2, status = 'published',
         published_url = $3, title = COALESCE(title, $4)
     WHERE id = $1`,
    [journalId, userId, publishedUrl, title],
  );
}

/**
 * Inserta la página publicada (snapshot del HTML/CSS final).
 */
export async function insertPublishedPage(input: {
  slug: string;
  journalId: string;
  userId: string;
  title: string | null;
  html: string;
  css: string;
}): Promise<{ id: string }> {
  const r = await query<{ id: string }>(
    `INSERT INTO published_pages (slug, journal_id, user_id, title, html, css)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      input.slug,
      input.journalId,
      input.userId,
      input.title,
      input.html,
      input.css,
    ],
  );
  return r.rows[0];
}

/**
 * Sobreescribe el HTML/CSS/title de una página publicada existente.
 * Útil cuando el estudiante "republica" tras editar — mantenemos el
 * mismo slug para que su mamá no pierda el link.
 */
export async function updatePublishedPageByJournal(input: {
  journalId: string;
  title: string | null;
  html: string;
  css: string;
}): Promise<{ slug: string } | null> {
  const r = await query<{ slug: string }>(
    `UPDATE published_pages
     SET html = $2, css = $3, title = $4
     WHERE journal_id = $1
     RETURNING slug`,
    [input.journalId, input.html, input.css, input.title],
  );
  return r.rows[0] ?? null;
}

export async function getPublishedPageBySlug(slug: string): Promise<{
  slug: string;
  title: string | null;
  html: string;
  css: string;
} | null> {
  const r = await query<{
    slug: string;
    title: string | null;
    html: string;
    css: string;
  }>(`SELECT slug, title, html, css FROM published_pages WHERE slug = $1`, [
    slug,
  ]);
  return r.rows[0] ?? null;
}

export async function recordNotification(input: {
  userId: string | null;
  kind: string;
  toEmail: string;
  subject: string | null;
  ok: boolean;
  reason?: string | null;
  providerId?: string | null;
}): Promise<void> {
  await query(
    `INSERT INTO notifications (user_id, kind, to_email, subject, ok, reason, provider_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.userId,
      input.kind,
      input.toEmail,
      input.subject,
      input.ok,
      input.reason ?? null,
      input.providerId ?? null,
    ],
  );
}

/** Página publicada del user (asumiendo a lo más una en v0). */
export async function getPublishedPageByUser(userId: string): Promise<{
  id: string;
  slug: string;
  title: string | null;
  created_at: string;
} | null> {
  const r = await query<{
    id: string;
    slug: string;
    title: string | null;
    created_at: string;
  }>(
    `SELECT id, slug, title, created_at FROM published_pages
     WHERE user_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  return r.rows[0] ?? null;
}

/** Lookup de usuario por id — usado por el middleware/dashboard al
 *  hidratar la sesión. Devuelve null si fue borrado. */
export async function getUserById(userId: string): Promise<UserRow | null> {
  const r = await query<UserRow>(
    `SELECT id, email, name, age, city, school, parent_email,
            created_at, updated_at
     FROM users WHERE id = $1`,
    [userId],
  );
  return r.rows[0] ?? null;
}

/** Journal más reciente del user (para el botón "continuar editando").
 *  Devuelve null si no tiene ninguno asociado. */
export async function getJournalIdByUser(
  userId: string,
): Promise<string | null> {
  const r = await query<{ id: string }>(
    `SELECT id FROM journals
     WHERE user_id = $1
     ORDER BY updated_at DESC LIMIT 1`,
    [userId],
  );
  return r.rows[0]?.id ?? null;
}

/** Sobreescribe HTML/CSS/title de una published_page por su id (slug
    permanece). */
export async function updatePublishedPageById(input: {
  id: string;
  title: string | null;
  html: string;
  css: string;
}): Promise<void> {
  await query(
    `UPDATE published_pages SET html = $2, css = $3, title = $4 WHERE id = $1`,
    [input.id, input.html, input.css, input.title],
  );
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const r = await query<{ id: string }>(
    `SELECT id FROM published_pages WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return r.rows.length > 0;
}
