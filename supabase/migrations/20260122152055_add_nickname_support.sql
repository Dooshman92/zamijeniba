/*
  # Add Nickname Support

  ## Changes
  1. Add nickname column to user_profiles
    - `nickname` (text, unique)
    - Create unique index for case-insensitive nickname lookup
  
  ## Security
  - Nickname must be unique across all users (case-insensitive)
*/

-- Add nickname column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'nickname'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN nickname text;
  END IF;
END $$;

-- Create unique index for case-insensitive nickname lookup
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_nickname_unique_idx 
ON user_profiles (LOWER(nickname))
WHERE nickname IS NOT NULL;