/*
  # Enable Realtime for Cars Table

  1. Changes
    - Enable realtime replication for the cars table so that any INSERT, UPDATE, or DELETE is broadcast to subscribed clients
  
  2. Security
    - No security changes needed - existing RLS policies already control access
*/

-- Enable realtime for cars table
ALTER PUBLICATION supabase_realtime ADD TABLE cars;