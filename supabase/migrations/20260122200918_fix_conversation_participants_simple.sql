/*
  # Fix Conversation Participants RLS - Simple Approach

  1. Changes
    - Drop ALL existing policies
    - Create a helper function to check conversation membership
    - Use the function in SELECT policy to avoid recursion
    
  2. Security
    - Users can view all participants in conversations where they are members
    - Non-recursive implementation using a stored function
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Authenticated users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update own participant records" ON conversation_participants;

-- Create a function to check if user is in a conversation
CREATE OR REPLACE FUNCTION is_conversation_member(conv_id uuid, check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conv_id
    AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create SELECT policy using the function
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (is_conversation_member(conversation_id, auth.uid()));

-- Policy for INSERT
CREATE POLICY "Users can add conversation participants"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for UPDATE
CREATE POLICY "Users can update own participant records"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());