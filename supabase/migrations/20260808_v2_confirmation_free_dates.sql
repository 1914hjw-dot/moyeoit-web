-- ============================================================================
-- Moyeoit V2.0 Database DDL Upgrade Script
-- Non-blocking Backward-Compatible Column Additions for Date Confirmation & Free Dates
-- ============================================================================

ALTER TABLE public.rooms 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  ADD COLUMN IF NOT EXISTS confirmed_date VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS date_selection_mode VARCHAR(20) NOT NULL DEFAULT 'RANGE';

-- Create Index for room status querying
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
