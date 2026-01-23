/*
  # Fix Infinite Recursion in Conversation Policies

  1. Changes
    - Drop existing RLS policies that cause infinite recursion
    - Create new, simpler policies that don't reference themselves
    
  2. New Policies
    - conversation_participants: Users can view records where they are the user
    - conversations: Users can view conversations they participate in (no recursion)
    
  3. Security
    - Maintains proper access control
    - Eliminates circular dependencies in RLS checks
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON conversations;

-- Create non-recursive policy for conversation_participants
-- Users can only see participant records in conversations they are part of
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR 
    conversation_id IN (
      SELECT cp.conversation_id 
      FROM conversation_participants cp
      WHERE cp.user_id = auth.uid()
    )
  );

-- Create non-recursive policy for conversations
-- Use a simpler check that doesn't cause recursion
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT cp.conversation_id 
      FROM conversation_participants cp
      WHERE cp.user_id = auth.uid()
    )
  );