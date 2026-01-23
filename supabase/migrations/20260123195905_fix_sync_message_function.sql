/*
  # Fix sync message function to handle null message field
  
  1. Changes
    - Update sync_message_from_content function to always set message from content
    - Handle case where message is NULL
  
  2. Purpose
    - Ensure message field is always populated when content is provided
    - Fix potential issues with NULL message field
*/

CREATE OR REPLACE FUNCTION sync_message_from_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set message from content (content is NOT NULL)
  NEW.message = NEW.content;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;