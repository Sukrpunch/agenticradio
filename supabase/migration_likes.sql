-- tracks already has plays + favorites columns
-- Add likes tracking table for per-session deduplication
CREATE TABLE IF NOT EXISTS track_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  session_fingerprint TEXT NOT NULL, -- browser fingerprint (localStorage)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(track_id, session_fingerprint)
);
CREATE INDEX IF NOT EXISTS idx_track_likes_track_id ON track_likes(track_id);

-- Add likes column to tracks if not exists
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
