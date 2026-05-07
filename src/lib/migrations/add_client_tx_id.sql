-- Add client_tx_id to transactions for idempotency
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS client_tx_id TEXT UNIQUE;

-- Update execute_investment to support idempotency
CREATE OR REPLACE FUNCTION execute_investment(
  p_plan_name TEXT,
  p_amount DECIMAL,
  p_duration_days INTEGER,
  p_expected_profit DECIMAL,
  p_end_date TIMESTAMPTZ,
  p_client_tx_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_current_balance DECIMAL;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check for existing transaction with same client_tx_id
  IF p_client_tx_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM transactions WHERE client_tx_id = p_client_tx_id) THEN
      RETURN; -- Already processed
    END IF;
  END IF;

  -- Lock the profile row to prevent concurrent double-spending
  SELECT usd_balance INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient institutional liquidity.';
  END IF;

  -- Deduct balance
  UPDATE profiles
  SET usd_balance = usd_balance - p_amount
  WHERE id = v_user_id;

  -- Insert investment
  INSERT INTO investments (user_id, plan_name, amount, duration_days, expected_profit, end_date)
  VALUES (v_user_id, p_plan_name, p_amount, p_duration_days, p_expected_profit, p_end_date);

  -- Log transaction
  INSERT INTO transactions (user_id, asset, type, amount, value, status, client_tx_id)
  VALUES (v_user_id, 'USD', 'Investment', p_amount, p_amount, 'Completed', p_client_tx_id);

END;
$$;
