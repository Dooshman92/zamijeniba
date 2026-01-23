/*
  # Add Admin Access to Promo Code Redemptions

  1. Changes
    - Add policy for admins to view all promo code redemptions
    - This allows admins to see who redeemed which codes and when
  
  2. Security
    - Only admin users (is_admin = true) can view all redemptions
    - Regular users can still only view their own redemptions (existing policy)
*/

-- Policy for admins to view all promo code redemptions
CREATE POLICY "Admins can view all promo code redemptions"
  ON promo_code_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );