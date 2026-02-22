/*
  # Add Car Warnings and Moderation System

  1. New Tables
    - `car_warnings`
      - `id` (uuid, primary key)
      - `car_id` (uuid, references cars)
      - `warned_by` (uuid, references user_profiles - moderator)
      - `reason` (text) - Why the warning was issued
      - `message` (text) - Message to the car owner
      - `status` (text) - pending, corrected, ignored
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz, nullable)
      
  2. Security
    - Enable RLS on `car_warnings` table
    - Only admins/moderators can create warnings
    - Car owners can view warnings on their cars
    - Admins can view all warnings
    
  3. Changes
    - Add warning_count to cars table to track warnings
    - Auto-hide cars with 3+ warnings
*/

-- Create car warnings table
CREATE TABLE IF NOT EXISTS car_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  warned_by uuid REFERENCES user_profiles(id) NOT NULL,
  reason text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'corrected', 'ignored')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Add warning_count to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'warning_count'
  ) THEN
    ALTER TABLE cars ADD COLUMN warning_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE car_warnings ENABLE ROW LEVEL SECURITY;

-- Admins and moderators can view all warnings
CREATE POLICY "Admins can view all warnings"
  ON car_warnings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true OR user_profiles.is_super_admin = true)
    )
  );

-- Car owners can view warnings on their cars
CREATE POLICY "Car owners can view their warnings"
  ON car_warnings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cars
      WHERE cars.id = car_warnings.car_id
      AND cars.user_id = auth.uid()
    )
  );

-- Only admins/moderators can create warnings
CREATE POLICY "Admins can create warnings"
  ON car_warnings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true OR user_profiles.is_super_admin = true)
    )
  );

-- Only admins/moderators can update warnings
CREATE POLICY "Admins can update warnings"
  ON car_warnings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true OR user_profiles.is_super_admin = true)
    )
  );

-- Function to increment warning count when warning is created
CREATE OR REPLACE FUNCTION increment_car_warning_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cars
  SET warning_count = warning_count + 1
  WHERE id = NEW.car_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to increment warning count
DROP TRIGGER IF EXISTS increment_warning_count_trigger ON car_warnings;
CREATE TRIGGER increment_warning_count_trigger
  AFTER INSERT ON car_warnings
  FOR EACH ROW
  EXECUTE FUNCTION increment_car_warning_count();

-- Function to auto-hide cars with 3+ warnings
CREATE OR REPLACE FUNCTION check_car_warning_threshold()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.warning_count >= 3 THEN
    UPDATE cars
    SET status = 'suspended'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check warning threshold
DROP TRIGGER IF EXISTS check_warning_threshold_trigger ON cars;
CREATE TRIGGER check_warning_threshold_trigger
  AFTER UPDATE OF warning_count ON cars
  FOR EACH ROW
  WHEN (NEW.warning_count >= 3)
  EXECUTE FUNCTION check_car_warning_threshold();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_car_warnings_car_id ON car_warnings(car_id);
CREATE INDEX IF NOT EXISTS idx_car_warnings_status ON car_warnings(status);
CREATE INDEX IF NOT EXISTS idx_car_warnings_created_at ON car_warnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_warning_count ON cars(warning_count);
