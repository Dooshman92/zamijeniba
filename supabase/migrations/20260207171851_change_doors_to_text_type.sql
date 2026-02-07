/*
  # Change Doors Column to Text Type

  1. Changes
    - Change `doors` column type from integer to text in `cars` table
    - This allows storing values like "2/3" and "4/5" which represent door configurations
    - Convert existing integer values to text equivalents

  2. Notes
    - Existing data will be preserved and converted to text
    - This supports the new door selection format where users choose "2/3" or "4/5"
*/

-- Convert doors column from integer to text
DO $$
BEGIN
  -- First, check if the column is currently integer type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' 
    AND column_name = 'doors' 
    AND data_type = 'integer'
  ) THEN
    -- Convert the column type to text, preserving existing data
    ALTER TABLE cars ALTER COLUMN doors TYPE text USING doors::text;
  END IF;
END $$;
