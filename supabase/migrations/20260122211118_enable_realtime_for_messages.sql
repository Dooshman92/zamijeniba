/*
  # Enable Real-time for Messages Table
  
  This migration enables Supabase real-time functionality for the messages table
  so that clients can receive instant notifications when new messages arrive.
  
  Changes:
  - Add messages table to supabase_realtime publication
*/

-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
