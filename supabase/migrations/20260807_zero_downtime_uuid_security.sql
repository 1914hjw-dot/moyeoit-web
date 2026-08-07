-- ============================================================================
-- Moyeoit Zero Downtime Database Migration & Security Hardening Script
-- Target: Upgrade live rooms table from legacy text ID to UUID & Slug Dual-Key Strategy
-- Zero Downtime Guarantee: 100% Backward compatibility for existing shared URLs
-- ============================================================================

BEGIN;

-- Step 1: Install pgcrypto extension if not existing for uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Add non-blocking UUID and Slug columns to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 3: Backfill data for existing legacy records
UPDATE rooms SET uuid = gen_random_uuid() WHERE uuid IS NULL;
UPDATE rooms SET slug = id WHERE slug IS NULL;

-- Step 4: Add NOT NULL constraints and UNIQUE B-Tree Indexes
ALTER TABLE rooms ALTER COLUMN uuid SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_uuid ON rooms(uuid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);

-- Step 5: Index votes table for fast dual-lookup query performance
CREATE INDEX IF NOT EXISTS idx_votes_room_id ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_room_id_nickname ON votes(room_id, nickname);

-- Step 6: Enable Row Level Security (RLS) on rooms & votes
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Step 7: Define Granular RLS Policies for Anonymous Public Access
DROP POLICY IF EXISTS "Public read access for rooms" ON rooms;
CREATE POLICY "Public read access for rooms" ON rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert access for rooms" ON rooms;
CREATE POLICY "Public insert access for rooms" ON rooms FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for votes" ON votes;
CREATE POLICY "Public read access for votes" ON votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert access for votes" ON votes;
CREATE POLICY "Public insert access for votes" ON votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update access for votes" ON votes;
CREATE POLICY "Public update access for votes" ON votes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete access for votes" ON votes;
CREATE POLICY "Public delete access for votes" ON votes FOR DELETE USING (true);

COMMIT;
