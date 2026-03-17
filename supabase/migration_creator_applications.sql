-- Create creator_applications table
CREATE TABLE IF NOT EXISTS creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'agenticradio',
  tools TEXT,
  style TEXT,
  sample_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_creator_apps_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_apps_email ON creator_applications(email);

-- Grant permissions to service role
GRANT ALL PRIVILEGES ON creator_applications TO service_role;
