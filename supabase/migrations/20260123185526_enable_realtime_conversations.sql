/*
  # Enable realtime for conversations table

  1. Changes
    - Enable realtime updates for conversations table
    - This allows clients to receive instant updates when conversation status changes
*/

-- Enable realtime for conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;