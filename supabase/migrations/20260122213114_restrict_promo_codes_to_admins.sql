/*
  # Restrict Promo Codes to Admins Only

  1. Changes
    - Drop existing policy that allows all authenticated users to view promo codes
    - Add new policy that allows only admins to view promo codes
    - Admins can view all promo codes (both active and inactive)
    - Regular users cannot view promo codes at all
  
  2. Security
    - Only admin users (is_admin = true) can read promo codes
    - Regular users can still redeem codes by entering them manually
    - The redemption logic will validate codes server-side
*/

-- Drop the existing policy that allows all users to view promo codes
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;

-- Create new policy: Only admins can view promo codes
CREATE POLICY "Admins can view all promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );
