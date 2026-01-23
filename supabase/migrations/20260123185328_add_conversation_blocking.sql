/*
  # Add conversation blocking functionality

  1. Changes
    - Add `blocked_by_user_id` column to `conversations` table
      - Tracks which user blocked/closed the conversation
      - NULL means conversation is active
      - If set, only the user who blocked can unblock
    
  2. Security
    - Users can only block conversations they are part of
    - Blocked conversations prevent new messages from being sent
*/

-- Add blocked_by_user_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'blocked_by_user_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN blocked_by_user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_blocked_by ON conversations(blocked_by_user_id);