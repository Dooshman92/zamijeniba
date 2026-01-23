/*
  # Make message field nullable
  
  1. Changes
    - Make message column nullable (it's auto-populated from content via trigger)
    - This prevents insert failures when only content is provided
  
  2. Purpose
    - The sync_message_from_content trigger automatically sets message from content
    - Making message nullable allows the trigger to work properly
    - Prevents "null value in column message violates not-null constraint" errors
*/

-- Make message column nullable
ALTER TABLE messages ALTER COLUMN message DROP NOT NULL;