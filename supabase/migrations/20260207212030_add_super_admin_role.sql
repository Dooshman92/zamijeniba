/*
  # Super Administrator System
  
  1. New Columns
    - `is_super_admin` (boolean) - Whether user is super administrator
    
  2. Description
    - Only super admin can add/remove administrators
    - Super admin is the highest privilege level
    - Regular admins cannot modify admin status of other users
    - Super admin can manage both admins and moderators
    
  3. Security
    - Restrict admin status changes to super admin only
    - Regular admins can still manage moderators
    - Super admin status cannot be changed by anyone except super admin
*/

-- Add is_super_admin column
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON user_profiles(is_super_admin);

-- Drop existing update policy and create new one with super admin restrictions
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

CREATE POLICY "Super admin and admins can update profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow super admin to update anyone
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
    OR
    -- Allow regular admins to update non-admin fields only
    (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND is_admin = true
      )
      AND id = auth.uid() -- Regular admins can only update their own profile
    )
    OR
    -- Allow users to update their own profile (non-privileged fields)
    id = auth.uid()
  )
  WITH CHECK (
    -- Super admin can change anything
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
    OR
    -- Regular users cannot escalate their own privileges
    (
      id = auth.uid() 
      AND is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid())
      AND is_moderator = (SELECT is_moderator FROM user_profiles WHERE id = auth.uid())
      AND is_super_admin = (SELECT is_super_admin FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to promote user to admin (only super admin can call this)
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admin can promote users to admin';
  END IF;
  
  -- Promote user to admin
  UPDATE user_profiles
  SET is_admin = true
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to demote admin to regular user (only super admin can call this)
CREATE OR REPLACE FUNCTION demote_from_admin(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admin can demote admins';
  END IF;
  
  -- Prevent demoting super admin
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = target_user_id AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Cannot demote super admin';
  END IF;
  
  -- Demote admin to regular user
  UPDATE user_profiles
  SET is_admin = false
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;