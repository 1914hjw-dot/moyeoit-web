-- Moyeoit production security hardening
-- Apply after deploying API code that supports sha256:-prefixed host secrets.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Existing host secrets were stored as raw capability values. Hash them in place;
-- browsers can keep sending the original value and the server verifies its digest.
UPDATE public.rooms
SET secret_hash = 'sha256:' || encode(digest(secret_hash, 'sha256'), 'hex')
WHERE secret_hash IS NOT NULL
  AND secret_hash <> ''
  AND secret_hash NOT LIKE 'sha256:%';

-- Previous public responses exposed vote tokens. Rotate every existing token so
-- captured values cannot authorize future mutations.
UPDATE public.votes
SET vote_token = gen_random_uuid();

ALTER TABLE public.rooms
  ALTER COLUMN confirmed_date TYPE VARCHAR(100);

-- The application now uses service_role-backed API routes exclusively. Do not let
-- the public Supabase key enumerate private columns or bypass API validation.
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

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
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rooms TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.audit_logs TO service_role;

-- Durable rate limiting for Vercel's multi-instance/serverless runtime.
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rate_limit_buckets TO service_role;

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_reset_at
  ON public.rate_limit_buckets(reset_at);

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

-- Keep cleanup privileged and include stale rate-limit buckets.
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
