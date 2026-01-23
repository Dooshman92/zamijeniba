/*
  # Add Delete Policies for Conversations

  1. Changes
    - Add DELETE policy for messages table
    - Add DELETE policy for conversation_participants table
    - Add DELETE policy for conversations table
  
  2. Security
    - Users can delete messages in conversations they are part of
    - Users can delete conversation participants in their conversations
    - Users can delete conversations they are part of
*/

-- Add DELETE policy for messages in conversations
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON messages;
CREATE POLICY "Users can delete messages in their conversations"
  ON messages FOR DELETE
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Add DELETE policy for conversation_participants
DROP POLICY IF EXISTS "Users can delete participants in their conversations" ON conversation_participants;
CREATE POLICY "Users can delete participants in their conversations"
  ON conversation_participants FOR DELETE
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Add DELETE policy for conversations
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;
CREATE POLICY "Users can delete their conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );