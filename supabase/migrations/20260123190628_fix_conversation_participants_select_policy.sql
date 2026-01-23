/*
  # Fix conversation_participants SELECT policy

  1. Changes
    - Drop existing restrictive SELECT policy
    - Add new policy that allows users to view all participants in conversations they are part of
    
  2. Security
    - Users can only see participants in conversations where they are also a participant
    - Prevents viewing random conversation participants
*/

-- Drop old restrictive policy
DROP POLICY IF EXISTS "View own participant records" ON conversation_participants;

-- Add new policy that allows viewing all participants in your conversations
CREATE POLICY "View participants in own conversations"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );