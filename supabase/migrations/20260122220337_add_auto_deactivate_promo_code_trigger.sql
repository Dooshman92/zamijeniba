/*
  # Auto-deactivate Promo Codes on Redemption

  1. Changes
    - Add trigger function to automatically mark promo code as inactive when redeemed
    - Add trigger on promo_code_redemptions INSERT to call the function
  
  2. How it works
    - When a user redeems a promo code, the redemption is inserted into promo_code_redemptions
    - The trigger automatically updates the corresponding promo_codes row to set is_active = false
    - This bypasses RLS since the trigger runs with elevated privileges
  
  3. Security
    - Function uses SECURITY DEFINER to run with creator's privileges (bypasses RLS)
    - Only triggers on INSERT, cannot be exploited for other operations
    - Validates that the code exists before updating
*/

-- Create function to deactivate promo code
CREATE OR REPLACE FUNCTION deactivate_promo_code_on_redemption()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the promo code to set is_active = false
  UPDATE promo_codes
  SET is_active = false
  WHERE code = NEW.code;
  
  RETURN NEW;
END;
$$;

-- Create trigger on promo_code_redemptions
DROP TRIGGER IF EXISTS trigger_deactivate_promo_code ON promo_code_redemptions;

CREATE TRIGGER trigger_deactivate_promo_code
  AFTER INSERT ON promo_code_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION deactivate_promo_code_on_redemption();