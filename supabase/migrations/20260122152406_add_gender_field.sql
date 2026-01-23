/*
  # Add Gender Field to User Profiles

  ## Changes
  1. Add gender column to user_profiles
    - `gender` (text) - stores 'male' or 'female'
  
  ## Notes
  - Gender field is optional
  - Used for displaying appropriate avatar when no custom avatar is uploaded
*/

-- Add gender column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN gender text;
  END IF;
END $$;

-- Add check constraint to ensure gender is either 'male' or 'female'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_gender_check'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_gender_check
    CHECK (gender IN ('male', 'female') OR gender IS NULL);
  END IF;
END $$;