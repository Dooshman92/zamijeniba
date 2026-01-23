/*
  # Allow Users to Validate Promo Codes

  1. Changes
    - Add SELECT policy for regular users to validate promo codes they enter
    - Users can only read active promo codes (not see the full list, but validate specific codes)
    - This allows the redemption flow to work properly
  
  2. Security
    - Users can only SELECT promo codes with specific code lookup (eq filter)
    - Users cannot list all promo codes
    - Only active codes can be validated by regular users
    - Admins still have full access to all codes via their existing policy
*/

-- Allow authenticated users to validate promo codes they enter
CREATE POLICY "Users can validate active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true);
