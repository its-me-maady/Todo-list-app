-- ─── Migration: align existing DB to TaskFlow backend schema ─────────────────
-- Safe to run multiple times (all statements are idempotent).

-- ── Users: add password_hash column (was OAuth-only before) ──────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- ── Tasks: add missing columns ────────────────────────────────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS label       TEXT    NOT NULL DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority    TEXT    NOT NULL DEFAULT 'NONE';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date    DATE;
ALTER TABLE tasks ALTER COLUMN description SET DEFAULT '';
UPDATE tasks SET description = '' WHERE description IS NULL;
ALTER TABLE tasks ALTER COLUMN description SET NOT NULL;
