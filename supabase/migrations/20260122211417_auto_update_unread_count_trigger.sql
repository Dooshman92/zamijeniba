/*
  # Auto-update Unread Count Trigger
  
  This migration creates a trigger that automatically updates the unread_count
  in conversation_participants whenever a new message is inserted.
  
  Changes:
  - Create function to increment unread_count for message receiver
  - Create trigger on messages table to call this function on INSERT
*/

-- Function to increment unread count for receiver
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread_count for the receiver in this conversation
  UPDATE conversation_participants
  SET unread_count = COALESCE(unread_count, 0) + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id = NEW.receiver_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS messages_increment_unread_trigger ON messages;
CREATE TRIGGER messages_increment_unread_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();
