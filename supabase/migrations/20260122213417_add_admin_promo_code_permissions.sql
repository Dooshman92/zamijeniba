/*
  # Add Admin Permissions for Promo Codes

  1. Changes
    - Add INSERT policy for admins to create promo codes
    - Add UPDATE policy for admins to modify promo codes
    - Add DELETE policy for admins to remove promo codes
  
  2. Security
    - Only admin users (is_admin = true) can create, update, or delete promo codes
    - These policies work alongside the existing SELECT policy for admins
*/

-- Policy for admins to insert promo codes
CREATE POLICY "Admins can insert promo codes"
  ON promo_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy for admins to update promo codes
CREATE POLICY "Admins can update promo codes"
  ON promo_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy for admins to delete promo codes
CREATE POLICY "Admins can delete promo codes"
  ON promo_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );
