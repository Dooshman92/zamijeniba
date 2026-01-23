/*
  # Sync Message and Content Fields
  
  1. Changes
    - Make content NOT NULL (currently nullable)
    - Add trigger to auto-sync message field from content
    - This ensures backward compatibility while using content as primary field
  
  2. Purpose
    - Eliminate confusion between message and content fields
    - Ensure all messages have content
*/

-- Make content NOT NULL (first copy any missing values from message)
UPDATE messages SET content = message WHERE content IS NULL;

ALTER TABLE messages ALTER COLUMN content SET NOT NULL;

-- Create function to sync message from content
CREATE OR REPLACE FUNCTION sync_message_from_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set message from content if content is provided
  IF NEW.content IS NOT NULL THEN
    NEW.message = NEW.content;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync on insert and update
DROP TRIGGER IF EXISTS trigger_sync_message_from_content ON messages;
CREATE TRIGGER trigger_sync_message_from_content
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_message_from_content();