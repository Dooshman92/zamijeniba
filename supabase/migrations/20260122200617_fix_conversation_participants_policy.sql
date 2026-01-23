/*
  # Fix Conversation Participants RLS Policy

  1. Changes
    - Drop the existing restrictive SELECT policy that only allows users to see themselves
    - Create a new SELECT policy that allows users to view all participants in conversations they're part of
    
  2. Security
    - Users can only see participants in conversations where they are also a participant
    - This enables viewing other users in the chat
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;

-- Create new policy that allows viewing all participants in user's conversations
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );