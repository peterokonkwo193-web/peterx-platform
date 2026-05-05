-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  duration_days INTEGER NOT NULL,
  expected_profit DECIMAL NOT NULL,
  status TEXT DEFAULT 'Active', -- 'Active', 'Completed'
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON investments FOR UPDATE USING (auth.uid() = user_id);
