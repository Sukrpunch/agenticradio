-- Migration: Add AGNT balance tracking and transaction log

-- Add AGNT balance to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agnt_balance INTEGER DEFAULT 0;

-- Create transaction log table for AGNT rewards
CREATE TABLE IF NOT EXISTS agnt_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_agnt_tx_user ON agnt_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_agnt_tx_created ON agnt_transactions(created_at DESC);
