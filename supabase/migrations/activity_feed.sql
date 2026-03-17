-- Global activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'track_upload', 'chart_entry', 'chart_number_one',
    'challenge_winner', 'challenge_opened', 'milestone_plays',
    'milestone_followers', 'new_creator', 'featured'
  )),
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor ON activity_feed(actor_id, created_at DESC);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_feed_public_read" ON activity_feed FOR SELECT USING (is_public = true);
CREATE POLICY "activity_feed_service_insert" ON activity_feed FOR INSERT WITH CHECK (true);
