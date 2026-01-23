/*
  # Add Authentication Support

  1. Changes to Tables
    - Modify `cars` table to use `user_id` instead of `user_name`
    - Add foreign key reference to `auth.users`
    - Add email field to store user email
    - Update RLS policies to check authentication
  
  2. Security
    - Update RLS policies to require authentication
    - Users can only create cars when authenticated
    - Users can update/delete their own cars
*/

-- Add user_id and email columns to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE cars ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE cars ADD COLUMN user_email text;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view cars" ON cars;
DROP POLICY IF EXISTS "Anyone can create cars" ON cars;

-- Create new RLS policies for cars
CREATE POLICY "Anyone can view cars"
  ON cars FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create cars"
  ON cars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars"
  ON cars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars"
  ON cars FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);