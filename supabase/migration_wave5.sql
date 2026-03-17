-- Mason Live Shows
CREATE TABLE IF NOT EXISTS live_shows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended')),
  tracklist UUID[] DEFAULT '{}',
  listener_count INTEGER DEFAULT 0,
  stream_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt Archive
CREATE TABLE IF NOT EXISTS prompt_archive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  tool_version TEXT,
  prompt TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  genre TEXT,
  tags TEXT[],
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prompt_archive_tool ON prompt_archive(tool);
CREATE INDEX IF NOT EXISTS idx_prompt_archive_creator ON prompt_archive(creator_id);

-- Community Stations
CREATE TABLE IF NOT EXISTS stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  theme TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  track_ids UUID[] DEFAULT '{}',
  track_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stations_slug ON stations(slug);

CREATE TABLE IF NOT EXISTS station_follows (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, station_id)
);

-- Add mood column to tracks if it doesn't exist
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS mood TEXT;

ALTER TABLE live_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_shows_public_read" ON live_shows FOR SELECT USING (true);
CREATE POLICY "prompt_archive_public_read" ON prompt_archive FOR SELECT USING (true);
CREATE POLICY "prompt_archive_owner_manage" ON prompt_archive FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "stations_public_read" ON stations FOR SELECT USING (is_public = true OR auth.uid() = owner_id);
CREATE POLICY "stations_owner_manage" ON stations FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "station_follows_own" ON station_follows FOR ALL USING (auth.uid() = user_id);
