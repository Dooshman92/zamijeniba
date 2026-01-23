/*
  # Add Car Status Field

  1. Changes
    - Add `status` column to `cars` table
      - Possible values: 'active', 'inactive', 'hidden'
      - Default: 'active'
    
  2. Notes
    - Active cars are shown to everyone
    - Inactive cars are not shown in listings but not deleted
    - Hidden cars are completely hidden from public view
*/

-- Add status column to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'status'
  ) THEN
    ALTER TABLE cars ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'hidden'));
  END IF;
END $$;

-- Update existing RLS policy for viewing cars to respect status
DROP POLICY IF EXISTS "Anyone can view cars" ON cars;
CREATE POLICY "Anyone can view active cars"
  ON cars FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);