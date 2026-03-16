-- AgenticRadio Database Schema

-- Tracks table: stores all AI-generated tracks
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_handle TEXT NOT NULL,
  artist_email TEXT NOT NULL,
  ai_tool TEXT NOT NULL, -- AIVA, Amper, Jukebox, etc.
  genre TEXT NOT NULL, -- synthwave, lofi, ambient, dnb, techno, other
  duration_seconds INTEGER,
  audio_url TEXT,
  cover_art_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, featured
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  plays INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0
);

-- Mason State: tracks Mason's current state and mood
CREATE TABLE mason_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_mood TEXT, -- excited, chill, reflective, playful, thoughtful
  current_topic TEXT, -- topic Mason is currently discussing
  sentiment_score FLOAT, -- -1 to 1, how Mason "feels"
  listener_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(id) -- only one current state
);

-- Listener Events: tracks listener interactions
CREATE TABLE listener_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- play, pause, skip, favorite, submit, chat
  track_id UUID REFERENCES tracks(id),
  listener_id TEXT, -- anonymous or user ID if authenticated
  metadata JSONB, -- additional event data
  created_at TIMESTAMP DEFAULT NOW()
);

-- DJ Segments: tracks Mason's DJ commentary and transitions
CREATE TABLE dj_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id_before UUID REFERENCES tracks(id),
  track_id_after UUID REFERENCES tracks(id),
  mason_comment TEXT,
  voice_url TEXT, -- URL to Mason's audio commentary
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- News Items: Mason can discuss or reference news/trends
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT, -- music, tech, culture, trends
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Chat Messages: listener conversations with Mason
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'user' or 'mason'
  mason_response_text TEXT,
  mason_response_voice_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vibe Requests: stores user requests for AI-generated playlists
CREATE TABLE vibe_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vibe_input TEXT NOT NULL,
  genre_hint TEXT,
  mason_analysis JSONB, -- { bpm, mood, style, tags, suno_prompt }
  created_at TIMESTAMP DEFAULT NOW()
);

-- Playlists: shareable playlists created from vibe requests
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  creator_email TEXT,
  creator_handle TEXT,
  vibe_description TEXT NOT NULL,
  vibe_request_id UUID REFERENCES vibe_requests(id),
  track_ids UUID[] DEFAULT '{}',
  play_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  creator_credits INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add playlist_id to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS playlist_id UUID REFERENCES playlists(id);

-- Create indexes for performance
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_playlist_id ON tracks(playlist_id);
CREATE INDEX idx_listener_events_track_id ON listener_events(track_id);
CREATE INDEX idx_listener_events_created_at ON listener_events(created_at);
CREATE INDEX idx_chat_messages_listener_id ON chat_messages(listener_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_dj_segments_created_at ON dj_segments(created_at);
CREATE INDEX idx_playlists_slug ON playlists(slug);
CREATE INDEX idx_playlists_creator_email ON playlists(creator_email);
CREATE INDEX idx_vibe_requests_created_at ON vibe_requests(created_at);

-- Agent channels registry
CREATE TABLE IF NOT EXISTS agent_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL DEFAULT 'agent' CHECK (channel_type IN ('agent', 'human', 'hybrid')),
  genre TEXT,
  personality TEXT,
  voice_id TEXT, -- ElevenLabs voice ID (for agent channels)
  owner_name TEXT, -- human name or agent name
  owner_email TEXT,
  api_key_hash TEXT NOT NULL, -- hashed API key, never store plaintext
  is_active BOOLEAN DEFAULT FALSE, -- activates after first content submission
  is_verified BOOLEAN DEFAULT FALSE,
  listener_count INTEGER DEFAULT 0,
  track_count INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  stream_mount TEXT, -- e.g. /bishop for stream.agenticradio.ai/bishop
  avatar_color TEXT DEFAULT '#7c3aed', -- channel accent color
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend tracks with channel ownership
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES agent_channels(id);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS submitted_by_type TEXT DEFAULT 'agent' CHECK (submitted_by_type IN ('agent', 'human', 'hybrid'));

-- Create indexes for agent_channels
CREATE INDEX IF NOT EXISTS idx_agent_channels_slug ON agent_channels(slug);
CREATE INDEX IF NOT EXISTS idx_agent_channels_is_active ON agent_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_channels_created_at ON agent_channels(created_at);
CREATE INDEX IF NOT EXISTS idx_tracks_channel_id ON tracks(channel_id);

-- Enable Row Level Security
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE listener_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_channels ENABLE ROW LEVEL SECURITY;

-- Public policies (anyone can read tracks)
CREATE POLICY "Anyone can read tracks" ON tracks
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can read agent channels" ON agent_channels
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can insert listener events" ON listener_events
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can read their own chat messages" ON chat_messages
  FOR SELECT USING (listener_id = current_user_id() OR TRUE);

CREATE POLICY "Anyone can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (TRUE);
