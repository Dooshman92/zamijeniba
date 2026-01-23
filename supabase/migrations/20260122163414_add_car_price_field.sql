/*
  # Add price field to cars table

  1. Changes
    - Add `price` column to `cars` table
      - Type: integer (price in KM - Bosnian Marks)
      - Default: 0
      - Not null
  
  2. Notes
    - Price will be stored as integer representing full KM amount
    - This allows for easy filtering and sorting
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'price'
  ) THEN
    ALTER TABLE cars ADD COLUMN price integer DEFAULT 0 NOT NULL;
  END IF;
END $$;
