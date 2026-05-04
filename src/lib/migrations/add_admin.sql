-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow admins to view all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view their own profile and admins can view all" 
ON profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);
