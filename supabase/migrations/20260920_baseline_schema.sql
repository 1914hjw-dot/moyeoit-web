-- ============================================================================
-- Moyeoit (모여잇) Idempotent Baseline Database Schema & Hardened RLS Policy
-- Consolidates all historical schema, security hardening, rate limiting,
-- feedback, and notice migrations into a single deterministic baseline.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Core Tables: rooms, votes, audit_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  legacy_slug VARCHAR(100),
  secret_hash TEXT,
  title VARCHAR(80) NOT NULL,
  description VARCHAR(200) DEFAULT '',
  schedule_type VARCHAR(20) NOT NULL DEFAULT 'date_only',
  candidate_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  confirmed_date VARCHAR(100) DEFAULT NULL,
  confirmed_at TIMESTAMPTZ DEFAULT NULL,
  date_selection_mode VARCHAR(20) NOT NULL DEFAULT 'RANGE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS legacy_slug VARCHAR(100),
  ADD COLUMN IF NOT EXISTS secret_hash TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  ADD COLUMN IF NOT EXISTS confirmed_date VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS date_selection_mode VARCHAR(20) NOT NULL DEFAULT 'RANGE',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.rooms
  ALTER COLUMN confirmed_date TYPE VARCHAR(100);

UPDATE public.rooms
SET legacy_slug = id
WHERE legacy_slug IS NULL
  AND id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

UPDATE public.rooms
SET secret_hash = 'sha256:' || encode(digest(secret_hash, 'sha256'), 'hex')
WHERE secret_hash IS NOT NULL
  AND secret_hash <> ''
  AND secret_hash NOT LIKE 'sha256:%';

CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  vote_token UUID DEFAULT gen_random_uuid(),
  nickname VARCHAR(30) NOT NULL,
  password_hash TEXT DEFAULT '',
  availability JSONB NOT NULL DEFAULT '{}'::jsonb,
  note VARCHAR(200) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  CONSTRAINT unique_room_nickname UNIQUE (room_id, nickname)
);

ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS vote_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Distributed Rate Limiting Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. Feedbacks & Notices Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  content VARCHAR(2000) NOT NULL,
  reply_email VARCHAR(255) DEFAULT NULL,
  page_path VARCHAR(255) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'READ', 'IN_PROGRESS', 'RESOLVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rooms_id ON public.rooms(id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_legacy_slug_active
  ON public.rooms(legacy_slug) WHERE deleted_at IS NULL AND legacy_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_status_active
  ON public.rooms(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_deleted_at
  ON public.rooms(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_votes_room_id ON public.votes(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_active_room
  ON public.votes(room_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_votes_active_room_nickname
  ON public.votes(room_id, lower(nickname)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_votes_vote_token
  ON public.votes(vote_token) WHERE deleted_at IS NULL AND vote_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_created
  ON public.audit_logs(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_reset_at
  ON public.rate_limit_buckets(reset_at);

CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks(status);

CREATE INDEX IF NOT EXISTS idx_notices_published
  ON public.notices(is_published, is_pinned, published_at DESC, created_at DESC);

-- ============================================================================
-- 5. Updated_at Trigger Functions & Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_votes_updated_at ON public.votes;
CREATE TRIGGER trigger_votes_updated_at
  BEFORE UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.moyeoit_feedback_notice_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_feedbacks_updated_at ON public.feedbacks;
CREATE TRIGGER trigger_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.moyeoit_feedback_notice_set_updated_at();

DROP TRIGGER IF EXISTS trigger_notices_updated_at ON public.notices;
CREATE TRIGGER trigger_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.moyeoit_feedback_notice_set_updated_at();

-- ============================================================================
-- 6. Row Level Security & Privileged Access Control (service_role only)
-- ============================================================================

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public rooms select policy" ON public.rooms;
DROP POLICY IF EXISTS "Public rooms insert policy" ON public.rooms;
DROP POLICY IF EXISTS "Rooms restrict update" ON public.rooms;
DROP POLICY IF EXISTS "Rooms restrict delete" ON public.rooms;
DROP POLICY IF EXISTS "Public read access for rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public insert access for rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public update access for rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public delete access for rooms" ON public.rooms;

DROP POLICY IF EXISTS "Public votes select policy" ON public.votes;
DROP POLICY IF EXISTS "Public votes insert policy" ON public.votes;
DROP POLICY IF EXISTS "Public votes update policy" ON public.votes;
DROP POLICY IF EXISTS "Public votes delete policy" ON public.votes;
DROP POLICY IF EXISTS "Public read access for votes" ON public.votes;
DROP POLICY IF EXISTS "Public insert access for votes" ON public.votes;
DROP POLICY IF EXISTS "Public update access for votes" ON public.votes;
DROP POLICY IF EXISTS "Public delete access for votes" ON public.votes;

DROP POLICY IF EXISTS "Public access for audit_logs" ON public.audit_logs;

REVOKE ALL ON TABLE public.rooms FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.votes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.audit_logs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.feedbacks FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.notices FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rooms TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.audit_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rate_limit_buckets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedbacks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notices TO service_role;

-- ============================================================================
-- 7. Security-Definer RPC Functions (service_role only)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_time_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  IF p_key IS NULL OR length(p_key) > 200 OR p_limit < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'invalid rate limit arguments';
  END IF;

  INSERT INTO public.rate_limit_buckets AS bucket (key, request_count, reset_at, updated_at)
  VALUES (p_key, 1, NOW() + make_interval(secs => p_window_seconds), NOW())
  ON CONFLICT (key) DO UPDATE
  SET request_count = CASE
        WHEN bucket.reset_at <= NOW() THEN 1
        ELSE bucket.request_count + 1
      END,
      reset_at = CASE
        WHEN bucket.reset_at <= NOW() THEN NOW() + make_interval(secs => p_window_seconds)
        ELSE bucket.reset_at
      END,
      updated_at = NOW()
  RETURNING request_count, reset_at INTO v_count, v_reset_at;

  allowed := v_count <= p_limit;
  remaining := GREATEST(0, p_limit - v_count);
  reset_time_seconds := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_reset_at - NOW())))::INTEGER);
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER)
  TO service_role;

CREATE OR REPLACE FUNCTION public.purge_expired_records()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.votes
    WHERE deleted_at < NOW() - INTERVAL '90 days'
       OR created_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.rooms
    WHERE deleted_at < NOW() - INTERVAL '90 days'
       OR created_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.audit_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.rate_limit_buckets
    WHERE reset_at < NOW() - INTERVAL '1 day';
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_records()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_records()
  TO service_role;

COMMIT;
