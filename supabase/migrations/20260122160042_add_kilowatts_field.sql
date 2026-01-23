/*
  # Add Kilowatts Field

  1. Changes
    - Add `kilowatts` (integer) column to `cars` table
      - Stores the power of the car in kW
      - Horse power (HP) will be calculated from kW (1 kW = 1.35962 HP)
  
  2. Notes
    - This allows users to enter kW and automatically calculate HP
*/

-- Add kilowatts column to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'kilowatts'
  ) THEN
    ALTER TABLE cars ADD COLUMN kilowatts integer;
  END IF;
END $$;