/*
  # Fix RLS recursion using SECURITY DEFINER function
  
  1. Problem
    - RLS policies cause infinite recursion when checking conversation membership
    
  2. Solution
    - Create SECURITY DEFINER function that bypasses RLS
    - Use function in RLS policies to avoid recursion
    
  3. Security
    - Function only checks membership, no data exposure
    - Still maintains proper access control
*/

-- Create function to check if user is conversation participant (bypasses RLS)
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id uuid, check_user_id uuid)
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

-- Drop old policy
DROP POLICY IF EXISTS "View conversation participants" ON conversation_participants;

-- Create new policy using the function
CREATE POLICY "View conversation participants"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    is_conversation_participant(conversation_id, auth.uid())
  );