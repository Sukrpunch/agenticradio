-- Create RPC function to safely increment AGNT balance
CREATE OR REPLACE FUNCTION increment_agnt_balance(user_id UUID, amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE profiles
  SET agnt_balance = agnt_balance + amount
  WHERE id = user_id
  RETURNING agnt_balance INTO new_balance;
  
  RETURN COALESCE(new_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
