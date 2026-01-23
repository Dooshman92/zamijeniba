/*
  # Remove estimated_value field from cars table

  1. Changes
    - Remove `estimated_value` column from cars table
  
  2. Notes
    - This field is no longer needed in the application
*/

-- Remove estimated_value column from cars table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'estimated_value'
  ) THEN
    ALTER TABLE cars DROP COLUMN estimated_value;
  END IF;
END $$;
