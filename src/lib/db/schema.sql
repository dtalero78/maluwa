-- Schema de Maluwa. Idempotente: se puede correr varias veces sin romper.
-- Aislado en `maluwa` para no contaminar `public` que comparte con otros
-- proyectos del cluster (rips, mielito).

CREATE SCHEMA IF NOT EXISTS maluwa;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- =====================================================================
-- users: cuentas reales (creadas en el momento de "publicar" un proyecto).
-- En el flujo sin login, el journal vive bajo un anon_token y no hay user.
-- =====================================================================
CREATE TABLE IF NOT EXISTS maluwa.users (
  id            uuid        PRIMARY KEY DEFAULT public.gen_random_uuid(),
  email         text        UNIQUE NOT NULL,
  password_hash text        NOT NULL,
  name          text,
  age           int,
  city          text,
  school        text,
  parent_email  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maluwa_users_email ON maluwa.users (email);

-- =====================================================================
-- journals: la conversación entera con la IA + estado del proyecto.
-- En v0 las entries se guardan en JSONB; cuando crezca el volumen se
-- normaliza a una tabla aparte. anon_token permite que un chico arme su
-- proyecto sin tener cuenta. Cuando publica, se "claima" creando un user
-- y seteando user_id (anon_token queda como histórico).
-- =====================================================================
CREATE TABLE IF NOT EXISTS maluwa.journals (
  id             uuid        PRIMARY KEY DEFAULT public.gen_random_uuid(),
  anon_token     text        NOT NULL,
  user_id        uuid        REFERENCES maluwa.users(id) ON DELETE SET NULL,
  project_type   text        NOT NULL DEFAULT 'negocio-barrio',
  title          text,
  status         text        NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','published','archived')),
  published_url  text,
  entries_json   jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maluwa_journals_anon_token
  ON maluwa.journals (anon_token);
CREATE INDEX IF NOT EXISTS idx_maluwa_journals_user
  ON maluwa.journals (user_id) WHERE user_id IS NOT NULL;

-- =====================================================================
-- ai_usage: registro fino de cada llamada a Claude para auditar costo.
-- Riesgo #1 del MARCO: el costo de IA puede matar el proyecto en mes 3.
-- =====================================================================
CREATE TABLE IF NOT EXISTS maluwa.ai_usage (
  id              bigserial   PRIMARY KEY,
  journal_id      uuid        REFERENCES maluwa.journals(id) ON DELETE SET NULL,
  model           text        NOT NULL,
  input_tokens    int         NOT NULL DEFAULT 0,
  output_tokens   int         NOT NULL DEFAULT 0,
  cache_read_tokens  int      NOT NULL DEFAULT 0,
  cache_write_tokens int      NOT NULL DEFAULT 0,
  cost_usd_cents  numeric(12, 4) NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maluwa_ai_usage_created_at
  ON maluwa.ai_usage (created_at DESC);

-- =====================================================================
-- published_pages: HTML/CSS final que sirve la app cuando alguien visita
-- maluwa.app/u/<slug>. Una fila por journal publicado. El snapshot se
-- copia aquí en el momento del "publicar"; si el chico cambia algo
-- después, su draft sigue editable pero la página pública queda igual
-- hasta que pulse "republicar" (v0.5).
-- =====================================================================
CREATE TABLE IF NOT EXISTS maluwa.published_pages (
  id          uuid        PRIMARY KEY DEFAULT public.gen_random_uuid(),
  slug        text        UNIQUE NOT NULL
                CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$'),
  journal_id  uuid        NOT NULL REFERENCES maluwa.journals(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES maluwa.users(id) ON DELETE CASCADE,
  title       text,
  html        text        NOT NULL,
  css         text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maluwa_published_user
  ON maluwa.published_pages (user_id);

-- =====================================================================
-- notifications: log de emails (avisos a padres y otros) que mandamos.
-- Sirve para auditar "no recibí nada" y para no duplicar el aviso si la
-- publicación se reintenta. provider_id es el ID que devuelve Resend.
-- =====================================================================
CREATE TABLE IF NOT EXISTS maluwa.notifications (
  id          bigserial   PRIMARY KEY,
  user_id     uuid        REFERENCES maluwa.users(id) ON DELETE SET NULL,
  kind        text        NOT NULL,
  to_email    text        NOT NULL,
  subject     text,
  provider_id text,
  ok          boolean     NOT NULL,
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- Trigger para mantener updated_at fresco.
-- =====================================================================
CREATE OR REPLACE FUNCTION maluwa.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_journals_touch ON maluwa.journals;
CREATE TRIGGER trg_journals_touch
  BEFORE UPDATE ON maluwa.journals
  FOR EACH ROW EXECUTE FUNCTION maluwa.touch_updated_at();

DROP TRIGGER IF EXISTS trg_users_touch ON maluwa.users;
CREATE TRIGGER trg_users_touch
  BEFORE UPDATE ON maluwa.users
  FOR EACH ROW EXECUTE FUNCTION maluwa.touch_updated_at();
