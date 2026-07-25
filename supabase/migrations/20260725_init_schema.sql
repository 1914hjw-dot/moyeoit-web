-- ====================================================================
-- Moyeoit (모여잇) Production Database Schema & RLS Security Migration
-- Migration Timestamp: 2026-07-25 (Hardened Version)
-- ====================================================================

-- 1. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  title VARCHAR(80) NOT NULL,
  description VARCHAR(200) DEFAULT '',
  schedule_type VARCHAR(20) NOT NULL DEFAULT 'date_only',
  candidate_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX IF NOT EXISTS idx_rooms_id ON public.rooms(id);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at);

-- 2. Create Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(30) NOT NULL,
  password_hash TEXT DEFAULT '',
  availability JSONB NOT NULL DEFAULT '{}'::jsonb,
  note VARCHAR(200) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_room_nickname UNIQUE (room_id, nickname)
);

CREATE INDEX IF NOT EXISTS idx_votes_room_id ON public.votes(room_id);

-- Trigger for auto updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_votes_updated_at ON public.votes;
CREATE TRIGGER trigger_votes_updated_at
  BEFORE UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 3. Row Level Security (RLS) Hardened Policies
-- ====================================================================

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Rooms Policies
DROP POLICY IF EXISTS "Public rooms select policy" ON public.rooms;
CREATE POLICY "Public rooms select policy" ON public.rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public rooms insert policy" ON public.rooms;
CREATE POLICY "Public rooms insert policy" ON public.rooms
  FOR INSERT WITH CHECK (char_length(title) > 0 AND char_length(title) <= 80);

DROP POLICY IF EXISTS "Rooms restrict update" ON public.rooms;
CREATE POLICY "Rooms restrict update" ON public.rooms
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Rooms restrict delete" ON public.rooms;
CREATE POLICY "Rooms restrict delete" ON public.rooms
  FOR DELETE USING (false);

-- Votes Policies
DROP POLICY IF EXISTS "Public votes select policy" ON public.votes;
CREATE POLICY "Public votes select policy" ON public.votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public votes insert policy" ON public.votes;
CREATE POLICY "Public votes insert policy" ON public.votes
  FOR INSERT WITH CHECK (char_length(nickname) > 0 AND char_length(nickname) <= 30);

-- RESTRICT DIRECT ANON UPDATES: Direct UPDATE via Supabase REST API without verified backend logic is BLOCKED.
-- All vote updates MUST be executed through Next.js API Routes where password verification & Rate Limit take place.
DROP POLICY IF EXISTS "Public votes update policy" ON public.votes;
CREATE POLICY "Public votes update policy" ON public.votes
  FOR UPDATE USING (false);

-- Votes delete policy restricted
DROP POLICY IF EXISTS "Public votes delete policy" ON public.votes;
CREATE POLICY "Public votes delete policy" ON public.votes
  FOR DELETE USING (false);
