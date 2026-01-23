/*
  # Fix create_conversation_with_participants to prevent duplicates
  
  1. Changes
    - Update function to check for existing conversation before creating
    - Return existing conversation ID if found
    - Only create new conversation if none exists
    
  2. Security
    - Maintains SECURITY DEFINER with authentication check
    - Prevents duplicate conversations between same users for same car
*/

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
  existing_conversation_id uuid;
  participant_ids uuid[];
BEGIN
  -- Ensure the caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if conversation already exists between these users for this car
  FOR existing_conversation_id IN
    SELECT c.id
    FROM conversations c
    WHERE c.car_id IS NOT DISTINCT FROM p_car_id
  LOOP
    -- Check if both users are participants
    SELECT ARRAY_AGG(cp.user_id ORDER BY cp.user_id)
    INTO participant_ids
    FROM conversation_participants cp
    WHERE cp.conversation_id = existing_conversation_id;
    
    -- If we found a conversation with exactly these two users, return it
    IF participant_ids IS NOT NULL AND 
       array_length(participant_ids, 1) = 2 AND
       participant_ids[1] = LEAST(user_id_1, user_id_2) AND
       participant_ids[2] = GREATEST(user_id_1, user_id_2) THEN
      RETURN existing_conversation_id;
    END IF;
  END LOOP;
  
  -- No existing conversation found, create new one
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