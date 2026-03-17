-- Remix chain: parent track reference
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS parent_track_id UUID REFERENCES tracks(id) ON DELETE SET NULL;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_remix BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS linked_video_url TEXT;

-- Weekly breakdowns
CREATE TABLE IF NOT EXISTS weekly_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  top_track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  top_creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  new_creators_count INTEGER DEFAULT 0,
  total_plays_week INTEGER DEFAULT 0,
  trending_genre TEXT,
  highlight_text TEXT,
  content JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weekly_breakdowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "breakdowns_public_read" ON weekly_breakdowns FOR SELECT USING (true);
