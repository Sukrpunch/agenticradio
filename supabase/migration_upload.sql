-- Creator upload flow migration
-- Ensure tracks table has all needed columns for uploads

ALTER TABLE tracks ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft','published','unlisted'));
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_creator_id ON tracks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tracks_status ON tracks(status);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at);

-- Enable RLS for tracks if not already enabled
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Allow public read of published tracks
CREATE POLICY IF NOT EXISTS "Anyone can read published tracks" ON tracks
  FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);

-- Allow creators to manage their own tracks
CREATE POLICY IF NOT EXISTS "Creators can manage their own tracks" ON tracks
  FOR ALL USING (auth.uid() = creator_id);

-- Supabase Storage buckets created via API (documented in README)
-- Bucket: "tracks" (audio files, public)
-- Bucket: "covers" (cover art, public)
