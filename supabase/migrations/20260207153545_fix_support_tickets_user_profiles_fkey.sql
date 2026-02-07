/*
  # Fix Support Tickets User Profiles Foreign Key

  1. Changes
    - Add explicit foreign key from support_tickets.user_id to user_profiles.id
    - This allows proper JOIN queries between support_tickets and user_profiles

  2. Notes
    - The foreign key already exists implicitly through auth.users
    - This adds an explicit constraint for better query performance
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'support_tickets_user_id_fkey_profiles'
    AND table_name = 'support_tickets'
  ) THEN
    ALTER TABLE support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey_profiles
    FOREIGN KEY (user_id) REFERENCES user_profiles(id);
  END IF;
END $$;
