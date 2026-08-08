-- ============================================================================
-- Moyeoit Production DB Integrity Migration: Room Primary Key & Foreign Key Alignment
-- Date: 2026-08-08
-- Purpose: Ensures legacy_slug column exists, backfills legacy IDs, aligns votes.room_id FK
-- ============================================================================

BEGIN;

-- 1. Ensure `rooms` table has legacy_slug, secret_hash, status, confirmed_date, deleted_at
ALTER TABLE public.rooms 
  ADD COLUMN IF NOT EXISTS legacy_slug VARCHAR(100),
  ADD COLUMN IF NOT EXISTS secret_hash TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  ADD COLUMN IF NOT EXISTS confirmed_date VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS date_selection_mode VARCHAR(20) NOT NULL DEFAULT 'RANGE',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Backfill legacy_slug for non-UUID legacy rooms (e.g., demo-room-1)
UPDATE public.rooms 
  SET legacy_slug = id 
  WHERE legacy_slug IS NULL 
    AND id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

-- 3. Ensure `votes` table has vote_token and deleted_at
ALTER TABLE public.votes 
  ADD COLUMN IF NOT EXISTS vote_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 4. High-Performance Partial Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_legacy_slug_active 
  ON public.rooms(legacy_slug) WHERE deleted_at IS NULL AND legacy_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_votes_active_room 
  ON public.votes(room_id, created_at) WHERE deleted_at IS NULL;

COMMIT;
