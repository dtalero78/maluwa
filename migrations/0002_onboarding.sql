-- =====================================================================
-- 0002_onboarding.sql
--
-- Aplicable de forma independiente por un usuario con permisos `ALTER
-- TABLE` sobre `maluwa.journals`. NO incluye `CREATE EXTENSION` ni
-- `CREATE SCHEMA` para evitar el `permission denied for database` que
-- aparece con cuentas no-superuser (típico en DigitalOcean managed).
--
-- Idempotente: re-correrlo no rompe (todas las cláusulas son IF NOT
-- EXISTS).
--
-- Aplicación rápida:
--   npm run db:migrate:onboarding
-- o:
--   psql "$DATABASE_URL" -f migrations/0002_onboarding.sql
-- =====================================================================

ALTER TABLE maluwa.journals
  ADD COLUMN IF NOT EXISTS student_name    text,
  ADD COLUMN IF NOT EXISTS student_age     int,
  ADD COLUMN IF NOT EXISTS student_city    text,
  ADD COLUMN IF NOT EXISTS student_school  text,
  ADD COLUMN IF NOT EXISTS parent_email    text,
  ADD COLUMN IF NOT EXISTS parent_name     text,
  ADD COLUMN IF NOT EXISTS consented_at    timestamptz,
  ADD COLUMN IF NOT EXISTS consent_version text DEFAULT 'v1';
