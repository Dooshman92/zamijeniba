/*
  # Enhanced Premium Features

  1. New Features
    - Add `is_featured` flag to cars table for premium priority listings
    - Add `featured_until` timestamp for featured listing duration
    - Add `view_count` to track car views
    - Add `priority_score` for search ranking (premium users get higher score)
    - Add `last_promoted_at` timestamp for tracking promotions
    
  2. New Tables
    - `car_views` - Track individual car views with user and timestamp
    
  3. Security
    - Enable RLS on `car_views` table
    - Add policies for viewing and inserting view records
    
  4. Premium Benefits
    - Premium users get featured listings
    - Premium users get view analytics
    - Premium users send email notifications
    - Premium users can have up to 15 images (already implemented)
*/

-- Add premium features to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE cars ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'featured_until'
  ) THEN
    ALTER TABLE cars ADD COLUMN featured_until timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE cars ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'priority_score'
  ) THEN
    ALTER TABLE cars ADD COLUMN priority_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'last_promoted_at'
  ) THEN
    ALTER TABLE cars ADD COLUMN last_promoted_at timestamptz;
  END IF;
END $$;

-- Create car_views table for tracking individual views
CREATE TABLE IF NOT EXISTS car_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip text,
  viewed_at timestamptz DEFAULT now() NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on car_views
ALTER TABLE car_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert view records (for tracking)
CREATE POLICY "Anyone can track car views"
  ON car_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Car owners can view their car analytics
CREATE POLICY "Car owners can view their analytics"
  ON car_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cars
      WHERE cars.id = car_views.car_id
      AND cars.user_id = auth.uid()
    )
  );

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
  ON car_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_car_views_car_id ON car_views(car_id);
CREATE INDEX IF NOT EXISTS idx_car_views_viewed_at ON car_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_is_featured ON cars(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cars_priority_score ON cars(priority_score DESC);

-- Function to update view count
CREATE OR REPLACE FUNCTION increment_car_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cars
  SET view_count = view_count + 1
  WHERE id = NEW.car_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS trigger_increment_car_view_count ON car_views;
CREATE TRIGGER trigger_increment_car_view_count
  AFTER INSERT ON car_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_car_view_count();

-- Update priority score for existing premium user cars
UPDATE cars
SET priority_score = 100
WHERE user_id IN (
  SELECT id FROM user_profiles WHERE is_premium = true
);

-- Update priority score for existing regular user cars
UPDATE cars
SET priority_score = 0
WHERE user_id IN (
  SELECT id FROM user_profiles WHERE is_premium = false OR is_premium IS NULL
);
