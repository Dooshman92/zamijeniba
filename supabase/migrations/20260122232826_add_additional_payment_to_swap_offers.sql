/*
  # Add Additional Payment Field to Swap Offers

  1. Changes
    - Add `additional_payment` column to `swap_offers` table
      - Type: NUMERIC (for storing monetary amounts with decimals)
      - Default: 0 (no additional payment by default)
      - Nullable: YES (optional field)
  
  2. Purpose
    - Allow users to specify an additional payment amount when offering a car swap
    - Enables users to offer their car plus cash for another car
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'swap_offers' AND column_name = 'additional_payment'
  ) THEN
    ALTER TABLE swap_offers ADD COLUMN additional_payment NUMERIC DEFAULT 0;
  END IF;
END $$;