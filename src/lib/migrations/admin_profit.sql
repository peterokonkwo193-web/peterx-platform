-- RPC for Admins to add profit to a user's balance
CREATE OR REPLACE FUNCTION admin_add_profit(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Check if the executor is an admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: Level 4 Clearance Required';
  END IF;

  -- 2. Update user balance
  UPDATE profiles
  SET usd_balance = usd_balance + p_amount
  WHERE id = p_user_id;

  -- 3. Log transaction
  INSERT INTO transactions (user_id, asset, type, amount, value, status)
  VALUES (p_user_id, 'USD', 'Profit', p_amount, p_amount, 'Completed');

END;
$$;
