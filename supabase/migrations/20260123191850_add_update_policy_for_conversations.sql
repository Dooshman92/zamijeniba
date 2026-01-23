/*
  # Add UPDATE policy for conversations table
  
  1. Problem
    - Users cannot update conversations (specifically blocked_by_user_id field)
    - No UPDATE policy exists for conversations table
    - Block/unblock buttons don't work
    
  2. Solution
    - Add UPDATE policy allowing participants to update conversations
    - Allow updating blocked_by_user_id and other conversation fields
    
  3. Security
    - Only conversation participants can update
    - Uses existing is_conversation_participant function
*/

-- Add UPDATE policy for conversations
CREATE POLICY "Participants can update conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    is_conversation_participant(id, auth.uid())
  )
  WITH CHECK (
    is_conversation_participant(id, auth.uid())
  );