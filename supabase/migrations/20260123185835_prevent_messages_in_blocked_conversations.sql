/*
  # Prevent messages in blocked conversations

  1. Changes
    - Add trigger to prevent inserting messages when conversation is blocked
    - This ensures no one can send messages when conversation is closed
  
  2. Security
    - Trigger fires before INSERT on messages table
    - Checks if the conversation has blocked_by_user_id set
    - Raises exception if conversation is blocked
*/

-- Create function to check if conversation is blocked
CREATE OR REPLACE FUNCTION check_conversation_not_blocked()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = NEW.conversation_id 
    AND blocked_by_user_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Cannot send messages to a blocked conversation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS prevent_messages_in_blocked_conversations ON messages;

-- Create trigger
CREATE TRIGGER prevent_messages_in_blocked_conversations
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_conversation_not_blocked();