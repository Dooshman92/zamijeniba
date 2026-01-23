/*
  # Add Foreign Key for Conversation Participants to User Profiles

  1. Changes
    - Add foreign key constraint from conversation_participants.user_id to user_profiles.id
    - This enables proper joins when fetching participant data with user profile information
    
  2. Security
    - No RLS changes needed
    - Foreign key ensures referential integrity
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'conversation_participants_user_id_fkey' 
    AND table_name = 'conversation_participants'
  ) THEN
    ALTER TABLE conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;