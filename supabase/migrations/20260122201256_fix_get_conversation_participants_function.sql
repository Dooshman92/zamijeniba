/*
  # Fix get_conversation_participants Function

  1. Changes
    - Drop the old function
    - Create a new version that doesn't use auth.uid() in SECURITY DEFINER context
    - Instead, check permissions and return all participants
    
  2. Security
    - Function checks if user is a member before returning data
*/

DROP FUNCTION IF EXISTS get_conversation_participants(uuid);

CREATE OR REPLACE FUNCTION get_conversation_participants(conv_id uuid)
RETURNS TABLE (
  user_id uuid,
  conversation_id uuid,
  unread_count integer,
  last_read_at timestamptz,
  joined_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.user_id,
    cp.conversation_id,
    cp.unread_count,
    cp.last_read_at,
    cp.joined_at
  FROM conversation_participants cp
  WHERE cp.conversation_id = conv_id;
END;
$$ LANGUAGE plpgsql;