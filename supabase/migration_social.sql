-- User profiles (tied to Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  agnt_balance INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments on tracks
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) <= 500),
  timestamp_ms INTEGER,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_track ON comments(track_id, created_at DESC);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Collaborations
CREATE TABLE IF NOT EXISTS collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'collaborator' CHECK (role IN ('creator','collaborator','remixer')),
  agnt_share INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add social fields to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_collab BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_remix BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS original_track_id UUID REFERENCES tracks(id);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_write" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_auth_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_delete" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "follows_public_read" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_auth_manage" ON follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "collabs_public_read" ON collaborations FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_ar_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_ar_user();

-- Follow counter triggers
CREATE OR REPLACE FUNCTION update_ar_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    UPDATE profiles SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_ar_follow_counts();
