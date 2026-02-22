/*
  # Fix conversation_participants RLS Error 500

  1. Problem
    - Current SELECT policy on conversation_participants is recursive
    - This causes Error 500 when trying to query the table
    
  2. Solution
    - Drop the problematic recursive policy
    - Create a simple, non-recursive policy that just checks user_id
    - Users can see their own conversation_participants records
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "select_conversation_participants" ON conversation_participants;

-- Create a simple non-recursive policy
CREATE POLICY "Users can view own conversation participants"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());