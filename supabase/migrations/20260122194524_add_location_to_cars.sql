/*
  # Add location field to cars table

  1. Changes
    - Add `location` column to `cars` table to store the city/location of the car
    - Add default value for existing records

  2. Notes
    - Existing records will have empty string as default location
    - Users can update location when editing their ads
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'location'
  ) THEN
    ALTER TABLE cars ADD COLUMN location text DEFAULT '';
  END IF;
END $$;
