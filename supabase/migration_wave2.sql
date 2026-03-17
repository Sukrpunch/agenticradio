-- Wave 2 Features: AGNT Tipping, What Made This, Verified Badges
-- Run this in Supabase SQL Editor for project: pulyknadryxelexmkwtq

-- $AGNT Tips
CREATE TABLE IF NOT EXISTS agnt_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Fraud: one tip per sender per track per day
  UNIQUE(sender_id, track_id, (created_at::date))
);
CREATE INDEX IF NOT EXISTS idx_agnt_tips_recipient ON agnt_tips(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agnt_tips_track ON agnt_tips(track_id, created_at DESC);

-- "What Made This" disclosure
CREATE TABLE IF NOT EXISTS track_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE UNIQUE,
  tools JSONB DEFAULT '[]', -- [{ name: "Suno", version: "3.5", role: "composition" }]
  prompt TEXT,
  notes TEXT,
  show_prompt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verified creator badge
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_note TEXT;

-- Fraud guard: velocity tracking
CREATE TABLE IF NOT EXISTS tip_velocity_log (
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hour_bucket TIMESTAMPTZ, -- truncated to hour
  tip_count INTEGER DEFAULT 0,
  new_account_tip_count INTEGER DEFAULT 0,
  PRIMARY KEY (creator_id, hour_bucket)
);

-- Add tip_count to tracks if missing
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS tip_count INTEGER DEFAULT 0;

ALTER TABLE agnt_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_velocity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tips_public_read" ON agnt_tips FOR SELECT USING (true);
CREATE POLICY "tips_auth_insert" ON agnt_tips FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "track_credits_public_read" ON track_credits FOR SELECT USING (true);
CREATE POLICY "track_credits_owner_manage" ON track_credits FOR ALL
  USING (track_id IN (SELECT id FROM tracks WHERE creator_id = auth.uid()));
CREATE POLICY "tip_velocity_service_only" ON tip_velocity_log FOR ALL USING (false);

-- Tip count trigger
CREATE OR REPLACE FUNCTION update_track_tip_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tracks SET tip_count = COALESCE(tip_count, 0) + 1 WHERE id = NEW.track_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tracks SET tip_count = GREATEST(0, COALESCE(tip_count, 0) - 1) WHERE id = OLD.track_id;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS on_agnt_tip ON agnt_tips;
CREATE TRIGGER on_agnt_tip
  AFTER INSERT OR DELETE ON agnt_tips
  FOR EACH ROW EXECUTE FUNCTION update_track_tip_count();

-- Update agnt_transactions with tip type if not exists
ALTER TABLE agnt_transactions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'earn';
ALTER TABLE agnt_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
