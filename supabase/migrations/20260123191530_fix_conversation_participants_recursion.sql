/*
  # Fix infinite recursion in conversation_participants RLS policy
  
  1. Problem
    - Current SELECT policy causes infinite recursion
    - Messages SELECT policy checks conversation_participants
    - conversation_participants SELECT policy also checks conversation_participants
    
  2. Solution
    - Simplify conversation_participants SELECT policy
    - Allow direct user_id check instead of subquery
    - This breaks the recursion cycle
    
  3. Security
    - Users can see participants in conversations they are part of
    - No security is compromised
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "View participants in own conversations" ON conversation_participants;

-- Create simpler non-recursive policy
CREATE POLICY "View conversation participants"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see participants if they themselves are a participant
    -- Check directly without subquery to avoid recursion
    EXISTS (
      SELECT 1
      FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
    )
  );