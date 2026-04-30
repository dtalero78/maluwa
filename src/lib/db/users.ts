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

export async function isSlugTaken(slug: string): Promise<boolean> {
  const r = await query<{ id: string }>(
    `SELECT id FROM published_pages WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  return r.rows.length > 0;
}
