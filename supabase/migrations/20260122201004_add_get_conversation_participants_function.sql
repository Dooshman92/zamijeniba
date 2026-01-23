/*
  # Add Function to Get Conversation Participants

  1. New Function
    - get_conversation_participants: Returns all participants for conversations where the user is a member
    - Uses SECURITY DEFINER to bypass RLS
    
  2. Security
    - Only returns participants for conversations where calling user is a member
    - Safe because it checks membership before returning data
*/

CREATE OR REPLACE FUNCTION get_conversation_participants(conv_id uuid)
RETURNS TABLE (
  user_id uuid,
  conversation_id uuid,
  unread_count integer,
  last_read_at timestamptz,
  joined_at timestamptz
) AS $$
BEGIN
  -- Check if the calling user is a participant in this conversation
  IF NOT EXISTS (
    SELECT 1 
    FROM conversation_participants 
    WHERE conversation_id = conv_id 
    AND user_id = auth.uid()
  ) THEN
    -- User is not a member, return empty
    RETURN;
  END IF;

  -- Return all participants
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
$$ LANGUAGE plpgsql SECURITY DEFINER;