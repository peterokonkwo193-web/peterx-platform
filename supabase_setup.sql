-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  usd_balance DECIMAL DEFAULT 10000,
  is_premium BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  amount DECIMAL DEFAULT 0,
  average_price DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  asset TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Buy', 'Sell', 'Deposit', 'Withdraw'
  amount DECIMAL NOT NULL,
  value DECIMAL NOT NULL,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own profile and admins can view all" 
ON profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own portfolio" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own portfolio" ON portfolios FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own watchlist" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own watchlist" ON watchlist FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, usd_balance)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 10000);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  target_price DECIMAL NOT NULL,
  condition TEXT NOT NULL, -- 'Above', 'Below'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);

-- [SECURITY UPDATE] Ensure investments table exists
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  duration_days INTEGER NOT NULL,
  expected_profit DECIMAL NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
CREATE POLICY "Users can view their own investments" ON investments FOR SELECT USING (auth.uid() = user_id);

-- [SECURITY UPDATE] Protect usd_balance from direct client updates
CREATE OR REPLACE FUNCTION protect_usd_balance() RETURNS trigger AS $$
BEGIN
  -- If the role is authenticated (meaning a direct client query) and the balance is changing
  IF current_setting('role') = 'authenticated' AND NEW.usd_balance IS DISTINCT FROM OLD.usd_balance THEN
      RAISE EXCEPTION 'Direct balance updates are forbidden. Use official protocol RPCs.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_balance_protection ON profiles;
CREATE TRIGGER enforce_balance_protection
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_usd_balance();

-- [SECURITY UPDATE] Transactional RPC for Investments
CREATE OR REPLACE FUNCTION execute_investment(
  p_plan_name TEXT,
  p_amount DECIMAL,
  p_duration_days INTEGER,
  p_expected_profit DECIMAL,
  p_end_date TIMESTAMPTZ
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
  INSERT INTO transactions (user_id, asset, type, amount, value, status)
  VALUES (v_user_id, 'USD', 'Investment', p_amount, p_amount, 'Completed');

END;
$$;
