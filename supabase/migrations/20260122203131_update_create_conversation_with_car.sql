/*
  # Update Conversation Creation to Include Car Reference

  1. Modifications
    - Update `create_conversation_with_participants` function to accept optional car_id
    - Set car_id when creating new conversation
    
  2. Purpose
    - Allow conversations to be linked to specific car listings
    - Track which car a conversation is about
    
  3. Security
    - Function remains SECURITY DEFINER with authentication check
    - car_id is optional (nullable) for backwards compatibility
*/

-- Update function to include car_id parameter
CREATE OR REPLACE FUNCTION create_conversation_with_participants(
  user_id_1 uuid,
  user_id_2 uuid,
  p_car_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_conversation_id uuid;
BEGIN
  -- Ensure the caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create the conversation with car_id
  INSERT INTO conversations (id, created_at, updated_at, last_message_at, car_id)
  VALUES (gen_random_uuid(), now(), now(), now(), p_car_id)
  RETURNING id INTO new_conversation_id;
  
  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id, joined_at, last_read_at, unread_count)
  VALUES 
    (new_conversation_id, user_id_1, now(), now(), 0),
    (new_conversation_id, user_id_2, now(), now(), 0);
  
  RETURN new_conversation_id;
END;
$$;