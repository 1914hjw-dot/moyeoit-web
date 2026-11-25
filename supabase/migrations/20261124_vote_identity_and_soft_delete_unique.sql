-- ============================================================================
-- Moyeoit (모여잇) Zero-Downtime Vote Identity & Soft-Delete Uniqueness Migration
--
-- Goals:
-- 1. Add nullable identity/password metadata columns without breaking running code.
-- 2. Keep normalized_nickname in sync with app logic:
--    lower(btrim(normalize(nickname, NFC)))
-- 3. Replace non-partial unique_room_nickname constraint with a partial unique
--    index on active votes (deleted_at IS NULL) so soft-deleted nicknames can
--    be re-used cleanly while blocking case/Unicode-equivalent collisions.
-- ============================================================================

BEGIN;

-- 1. Additive nullable columns (safe during rolling deployments)
ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS normalized_nickname VARCHAR(60) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Backfill metadata for existing rows without touching auth credentials
UPDATE public.votes
SET normalized_nickname = lower(btrim(normalize(nickname, NFC)))
WHERE normalized_nickname IS DISTINCT FROM lower(btrim(normalize(nickname, NFC)));

UPDATE public.votes
SET password_updated_at = COALESCE(updated_at, created_at, NOW())
WHERE password_updated_at IS NULL
  AND btrim(COALESCE(password_hash, '')) <> '';

-- 3. Trigger to maintain normalized_nickname and password_updated_at across versions
CREATE OR REPLACE FUNCTION public.sync_vote_identity_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.normalized_nickname := lower(btrim(normalize(NEW.nickname, NFC)));

  IF TG_OP = 'INSERT' THEN
    IF btrim(COALESCE(NEW.password_hash, '')) <> '' AND NEW.password_updated_at IS NULL THEN
      NEW.password_updated_at := NOW();
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.password_hash IS DISTINCT FROM OLD.password_hash
       AND btrim(COALESCE(NEW.password_hash, '')) <> '' THEN
      NEW.password_updated_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_votes_identity_metadata ON public.votes;
CREATE TRIGGER trigger_votes_identity_metadata
  BEFORE INSERT OR UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_vote_identity_metadata();

-- 4. Pre-flight check: abort cleanly if active normalized duplicates already exist
DO $$
DECLARE
  v_dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_dup_count
  FROM (
    SELECT room_id, lower(btrim(normalize(nickname, NFC)))
    FROM public.votes
    WHERE deleted_at IS NULL
    GROUP BY room_id, lower(btrim(normalize(nickname, NFC)))
    HAVING COUNT(*) > 1
  ) dup;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'Active duplicate normalized nicknames found (% group(s)). Resolve active duplicates before creating partial unique index.', v_dup_count;
  END IF;
END $$;

-- 5. Create partial unique index BEFORE dropping legacy constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_active_room_nickname
  ON public.votes (room_id, lower(btrim(normalize(nickname, NFC))))
  WHERE deleted_at IS NULL;

-- 6. Drop non-partial constraint so soft-deleted rows do not block re-voting
ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS unique_room_nickname;

COMMIT;
