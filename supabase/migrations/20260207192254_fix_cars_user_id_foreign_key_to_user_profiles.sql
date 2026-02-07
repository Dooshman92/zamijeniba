/*
  # Fix Cars Foreign Key to Point to User Profiles

  1. Changes
    - Drop existing foreign key that points to auth.users
    - Add new foreign key that points to user_profiles
    - This enables Supabase to perform JOIN queries with user_profiles(nickname) syntax
  
  2. Security
    - No changes to RLS policies
    - Foreign key ensures referential integrity
*/

-- Drop the old foreign key that points to auth.users
ALTER TABLE cars
DROP CONSTRAINT IF EXISTS cars_user_id_fkey;

-- Add new foreign key that points to user_profiles
ALTER TABLE cars
ADD CONSTRAINT cars_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;