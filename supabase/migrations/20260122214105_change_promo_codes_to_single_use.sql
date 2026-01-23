/*
  # Change Promo Codes to Single Use Only

  1. Changes
    - Remove `max_uses` and `current_uses` columns from promo_codes table
    - Each promo code can now only be redeemed once by one user
    - No need to track usage counts anymore
    - Admins create unique codes for each use
  
  2. Security
    - Existing RLS policies remain unchanged
    - Redemption logic simplified - each code works only once
*/

-- Drop the columns for max_uses and current_uses
ALTER TABLE promo_codes 
  DROP COLUMN IF EXISTS max_uses,
  DROP COLUMN IF EXISTS current_uses;
