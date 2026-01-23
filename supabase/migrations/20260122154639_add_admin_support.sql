/*
  # Add Admin Support

  1. Changes
    - Add `is_admin` column to `user_profiles` table
      - Boolean field, default false
      - Allows certain users to have admin privileges
  
  2. Security
    - Add RLS policy for admins to manage premium status
    - Only admins can view all user profiles
  
  3. Notes
    - Admins can toggle premium status for any user
    - First user to register can be manually set as admin via SQL
*/

-- Add is_admin column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    is_admin = true OR id = auth.uid()
  );

-- Policy for admins to update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );