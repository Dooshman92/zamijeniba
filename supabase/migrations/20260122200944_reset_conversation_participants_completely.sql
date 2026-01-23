/*
  # Complete Reset of Conversation Participants RLS

  1. Changes
    - Drop all policies first
    - Drop the helper function
    - Create ultra-simple policies
    
  2. Security
    - Users see only their own participant records
    - Simple, non-recursive implementation
*/

-- Drop ALL policies first
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users see own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Authenticated users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users update own records" ON conversation_participants;

-- Now drop the function
DROP FUNCTION IF EXISTS is_conversation_member(uuid, uuid);

-- Create ultra-simple SELECT policy
CREATE POLICY "View own participant records"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Permissive INSERT policy  
CREATE POLICY "Insert participant records"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy
CREATE POLICY "Update own participant records"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());