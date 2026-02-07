/*
  # Add Foreign Key Relationship Between Cars and User Profiles

  1. Changes
    - Add foreign key constraint from cars.user_id to user_profiles.id
    - This enables Supabase to perform JOIN queries with user_profiles(nickname) syntax
  
  2. Security
    - No changes to RLS policies
    - Foreign key ensures referential integrity
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cars_user_id_fkey' 
    AND table_name = 'cars'
  ) THEN
    ALTER TABLE cars
    ADD CONSTRAINT cars_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;