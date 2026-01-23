/*
  # Simplify Conversation Policies to Prevent Recursion

  1. Changes
    - Replace complex recursive policies with simple direct checks
    - conversation_participants: Direct user_id check only
    - conversations: Use security definer function to break recursion
    
  2. Security
    - Users can only see their own participant records
    - Users can see conversations through a non-recursive function
*/

-- Drop the policies we just created that still have issues
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

-- Simple policy for conversation_participants - no subqueries
CREATE POLICY "Users can view their own participation"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create a security definer function to check conversation access
-- This breaks the recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION user_has_conversation_access(conv_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM conversation_participants 
    WHERE conversation_id = conv_id 
    AND user_id = check_user_id
  );
$$;

-- Policy for conversations using the security definer function
CREATE POLICY "Users can view accessible conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_has_conversation_access(id, auth.uid()));