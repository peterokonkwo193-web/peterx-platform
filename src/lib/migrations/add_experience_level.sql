-- Add experience_level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'Beginner';

-- Update handle_new_user function to include experience_level
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, usd_balance, experience_level)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    10000,
    COALESCE(new.raw_user_meta_data->>'experience_level', 'Beginner')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
