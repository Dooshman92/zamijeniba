/*
  # Add Created By Field to Promo Codes

  1. Changes
    - Add `created_by` column to promo_codes table (references user_profiles)
    - Add `promo_code_id` column to promo_code_redemptions table for better foreign key relationship
    - Update existing promo codes to set created_by to first admin user
  
  2. Security
    - Update RLS policies to allow admins to create and manage promo codes
*/

-- Add created_by column to promo_codes
ALTER TABLE promo_codes 
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES user_profiles(id);

-- Set existing promo codes to first admin user (if any exist)
DO $$
DECLARE
  first_admin_id uuid;
BEGIN
  SELECT id INTO first_admin_id FROM user_profiles WHERE is_admin = true LIMIT 1;
  
  IF first_admin_id IS NOT NULL THEN
    UPDATE promo_codes 
    SET created_by = first_admin_id 
    WHERE created_by IS NULL;
  END IF;
END $$;

-- Add promo_code_id to promo_code_redemptions for better foreign key relationship
ALTER TABLE promo_code_redemptions 
  ADD COLUMN IF NOT EXISTS promo_code_id uuid REFERENCES promo_codes(id);

-- Enable RLS policies for admin management
DROP POLICY IF EXISTS "Admins can insert promo codes" ON promo_codes;
CREATE POLICY "Admins can insert promo codes"
  ON promo_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete promo codes" ON promo_codes;
CREATE POLICY "Admins can delete promo codes"
  ON promo_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
