/*
  # Add Missing Car Columns

  1. Changes
    - Add `damaged` (boolean) column to `cars` table
      - Indicates if the car has any damage
      - Default value is false
  
  2. Notes
    - This column is used in the car addition form
    - Allows users to indicate if their car has damage
*/

-- Add damaged column to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'damaged'
  ) THEN
    ALTER TABLE cars ADD COLUMN damaged boolean DEFAULT false;
  END IF;
END $$;