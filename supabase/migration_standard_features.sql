-- Standard Features Migration: Persistent Player, Playlists, History, Likes, Search Memory

-- Playlists
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  track_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

CREATE TABLE IF NOT EXISTS playlist_follows (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, playlist_id)
);

-- Listen history
CREATE TABLE IF NOT EXISTS listen_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  listened_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listen_history_user ON listen_history(user_id, listened_at DESC);

-- Track likes (user-based, replaces session-based version)
DROP TABLE IF EXISTS track_likes CASCADE;

CREATE TABLE IF NOT EXISTS track_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);

-- Search history (for personalized shelf)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, created_at DESC);

-- RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE listen_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlists_public_read" ON playlists FOR SELECT USING (is_public = true OR auth.uid() = creator_id);
CREATE POLICY "playlists_owner_manage" ON playlists FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "playlist_tracks_public_read" ON playlist_tracks FOR SELECT USING (true);
CREATE POLICY "playlist_tracks_owner_manage" ON playlist_tracks FOR ALL
  USING (playlist_id IN (SELECT id FROM playlists WHERE creator_id = auth.uid()));
CREATE POLICY "playlist_follows_own" ON playlist_follows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "listen_history_own" ON listen_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "track_likes_public_read" ON track_likes FOR SELECT USING (true);
CREATE POLICY "track_likes_own_manage" ON track_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "search_history_own" ON search_history FOR ALL USING (auth.uid() = user_id);

-- Track like count trigger
CREATE OR REPLACE FUNCTION update_track_like_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tracks SET like_count = COALESCE(like_count,0) + 1 WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tracks SET like_count = GREATEST(0, COALESCE(like_count,0) - 1) WHERE id = OLD.track_id;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS on_track_like ON track_likes;
CREATE TRIGGER on_track_like AFTER INSERT OR DELETE ON track_likes FOR EACH ROW EXECUTE FUNCTION update_track_like_count();

-- Playlist track count trigger
CREATE OR REPLACE FUNCTION update_playlist_track_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE playlists SET track_count = track_count + 1 WHERE id = NEW.playlist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE playlists SET track_count = GREATEST(0, track_count - 1) WHERE id = OLD.playlist_id;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS on_playlist_track_change ON playlist_tracks;
CREATE TRIGGER on_playlist_track_change AFTER INSERT OR DELETE ON playlist_tracks FOR EACH ROW EXECUTE FUNCTION update_playlist_track_count();

-- Add like_count to tracks if not exists
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
