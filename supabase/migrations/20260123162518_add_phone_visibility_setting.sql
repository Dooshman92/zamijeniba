/*
  # Add Phone Number Visibility Setting

  1. Changes
    - Add `show_phone_number` boolean field to user_profiles table
    - Default value is false (phone number hidden by default)
    - Users can choose to make their phone number visible to all
  
  2. Notes
    - Phone number will also be shown when swap offer is accepted
    - This gives users control over their privacy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'show_phone_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN show_phone_number boolean DEFAULT false;
  END IF;
END $$;