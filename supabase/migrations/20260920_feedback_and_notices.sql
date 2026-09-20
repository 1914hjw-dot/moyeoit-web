-- ====================================================================
-- Moyeoit (모여잇) Production Additive Migration: Feedbacks & Notices
-- Migration Timestamp: 2026-09-20 (Revision 3 - Unique Function Name)
-- ====================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Dedicated Updated_at Trigger Function (Isolated to avoid generic name collisions)
CREATE OR REPLACE FUNCTION public.moyeoit_feedback_notice_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Feedbacks Table
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

CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks(status);

DROP TRIGGER IF EXISTS trigger_feedbacks_updated_at ON public.feedbacks;
CREATE TRIGGER trigger_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.moyeoit_feedback_notice_set_updated_at();

-- 3. Create Notices Table
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

CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices(is_published, is_pinned, published_at DESC, created_at DESC);

DROP TRIGGER IF EXISTS trigger_notices_updated_at ON public.notices;
CREATE TRIGGER trigger_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.moyeoit_feedback_notice_set_updated_at();

-- 4. Row Level Security (RLS) & Role Privileges (Hardened Production Model)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.feedbacks FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.notices FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedbacks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notices TO service_role;

COMMIT;
