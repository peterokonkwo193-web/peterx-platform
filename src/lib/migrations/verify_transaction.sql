-- RPC for Admins to verify and approve/reject transactions
CREATE OR REPLACE FUNCTION verify_transaction(
  p_transaction_id UUID,
  p_amount DECIMAL,
  p_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_asset TEXT;
  v_type TEXT;
  v_current_status TEXT;
BEGIN
  -- Check if caller is admin
  IF NOT (SELECT is_admin FROM profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Institutional Admin privileges required.';
  END IF;

  -- Get transaction details
  SELECT user_id, asset, type, status INTO v_user_id, v_asset, v_type, v_current_status
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found.';
  END IF;

  IF v_current_status != 'Pending Verification' THEN
    RAISE EXCEPTION 'Transaction is already processed.';
  END IF;

  -- Update transaction status and amount
  UPDATE transactions
  SET status = p_status,
      amount = p_amount,
      value = p_amount -- Assuming 1:1 for USD or already converted
  WHERE id = p_transaction_id;

  -- If approved and it's a deposit, update user balance
  IF p_status = 'Completed' AND v_type = 'Deposit' THEN
    IF v_asset = 'USD' THEN
      UPDATE profiles
      SET usd_balance = usd_balance + p_amount
      WHERE id = v_user_id;
    ELSE
      -- Handle crypto deposit (simplified: add to portfolio)
      INSERT INTO portfolios (user_id, symbol, amount, average_price)
      VALUES (v_user_id, v_asset, p_amount, 1) -- Price placeholder
      ON CONFLICT (user_id, symbol)
      DO UPDATE SET amount = portfolios.amount + p_amount;
    END IF;
  END IF;

END;
$$;
