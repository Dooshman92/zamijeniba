/*
  # Remove Duplicate Unread Count Trigger
  
  Fix for double-counting unread messages. Two triggers were created
  that both increment unread_count on message insert.
  
  Changes:
  - Drop the older trigger: trigger_increment_unread_count
  - Keep the newer trigger: messages_increment_unread_trigger
*/

-- Remove the duplicate older trigger
DROP TRIGGER IF EXISTS trigger_increment_unread_count ON messages;
