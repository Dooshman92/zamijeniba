/*
  # Add Advertisements System

  1. New Tables
    - `advertisements`
      - `id` (uuid, primary key)
      - `title` (text) - Ad title/name
      - `description` (text, nullable) - Optional description
      - `image_url` (text, nullable) - Image URL for the ad
      - `target_url` (text, nullable) - Link when ad is clicked
      - `position` (integer) - Position in footer (1=left, 2=center, 3=right)
      - `is_active` (boolean) - Whether ad is currently displayed
      - `clicks_count` (integer) - Track number of clicks
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `advertisements` table
    - Anyone can view active advertisements
    - Only admins can create, update, or delete advertisements
    - Track clicks without authentication requirement

  3. Important Notes
    - Ads are displayed based on position and active status
    - Click tracking is anonymous
    - Admins have full control over ad management
*/

CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  target_url text,
  position integer NOT NULL CHECK (position >= 1 AND position <= 3),
  is_active boolean DEFAULT true,
  clicks_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Anyone can view active advertisements
CREATE POLICY "Anyone can view active advertisements"
  ON advertisements
  FOR SELECT
  USING (is_active = true);

-- Admins can view all advertisements
CREATE POLICY "Admins can view all advertisements"
  ON advertisements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Admins can create advertisements
CREATE POLICY "Admins can create advertisements"
  ON advertisements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Admins can update advertisements
CREATE POLICY "Admins can update advertisements"
  ON advertisements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Admins can delete advertisements
CREATE POLICY "Admins can delete advertisements"
  ON advertisements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_advertisement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_advertisement_timestamp
  BEFORE UPDATE ON advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_advertisement_updated_at();