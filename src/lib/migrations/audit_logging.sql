-- Create audit_logs table for institutional compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'VERIFY_TRANSACTION', 'UPDATE_PROFILE', 'DELETE_USER'
  target_id UUID, -- ID of the user or transaction being acted upon
  details JSONB, -- Additional context (e.g., old/new values)
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Update verify_transaction RPC to include audit logging
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
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can verify transactions';
  END IF;

  -- Get transaction details
  SELECT user_id, asset INTO v_user_id, v_asset
  FROM transactions
  WHERE id = p_transaction_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET status = p_status, amount = p_amount
  WHERE id = p_transaction_id;

  -- If completed and it's a deposit, update user balance
  IF p_status = 'Completed' THEN
    IF v_asset = 'USD' THEN
      UPDATE profiles
      SET usd_balance = usd_balance + p_amount
      WHERE id = v_user_id;
    ELSE
      -- Handle other assets in portfolio
      INSERT INTO portfolios (user_id, symbol, amount)
      VALUES (v_user_id, v_asset, p_amount)
      ON CONFLICT (user_id, symbol)
      DO UPDATE SET amount = portfolios.amount + p_amount;
    END IF;
  END IF;

  -- Log the administrative action
  INSERT INTO audit_logs (admin_id, action_type, target_id, details)
  VALUES (
    v_admin_id, 
    'VERIFY_TRANSACTION', 
    p_transaction_id, 
    jsonb_build_object('status', p_status, 'amount', p_amount, 'asset', v_asset)
  );

END;
$$;
