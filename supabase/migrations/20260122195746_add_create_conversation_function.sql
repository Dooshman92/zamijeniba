/*
  # Add Function to Create Conversation with Participants

  1. New Function
    - `create_conversation_with_participants(user_id_1 uuid, user_id_2 uuid)`
    - Creates conversation and adds both participants atomically
    - Returns conversation_id
    - Uses SECURITY DEFINER to bypass RLS during creation
    
  2. Security
    - Function is SECURITY DEFINER but validates caller is authenticated
    - Ensures both participants are added before returning
    - Prevents orphaned conversations
*/

-- Function to create a conversation with participants atomically
CREATE OR REPLACE FUNCTION create_conversation_with_participants(
  user_id_1 uuid,
  user_id_2 uuid
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
  
  -- Create the conversation
  INSERT INTO conversations (id, created_at, updated_at, last_message_at)
  VALUES (gen_random_uuid(), now(), now(), now())
  RETURNING id INTO new_conversation_id;
  
  -- Add both participants
  INSERT INTO conversation_participants (conversation_id, user_id, joined_at, last_read_at, unread_count)
  VALUES 
    (new_conversation_id, user_id_1, now(), now(), 0),
    (new_conversation_id, user_id_2, now(), now(), 0);
  
  RETURN new_conversation_id;
END;
$$;