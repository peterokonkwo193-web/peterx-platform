-- Create futures_positions table
CREATE TABLE IF NOT EXISTS futures_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Long', 'Short'
  leverage INTEGER DEFAULT 1,
  entry_price DECIMAL NOT NULL,
  amount DECIMAL NOT NULL, -- Position size in asset units
  margin DECIMAL NOT NULL, -- Collateral in USD
  liquidation_price DECIMAL NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create staking_positions table
CREATE TABLE IF NOT EXISTS staking_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  asset TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  apr DECIMAL NOT NULL,
  lock_period INTEGER NOT NULL, -- in days
  unlock_at TIMESTAMPTZ NOT NULL,
  rewards_accumulated DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'Active', -- 'Active', 'Unstaked'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE futures_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_positions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own futures positions" ON futures_positions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own staking positions" ON staking_positions FOR ALL USING (auth.uid() = user_id);
