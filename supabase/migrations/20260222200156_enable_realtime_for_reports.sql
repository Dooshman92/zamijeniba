/*
  # Enable Realtime for Reports Table

  1. Changes
    - Enable realtime replication for `reports` table
    - Allows live updates for pending reports counter in admin panel
*/

DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE reports;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already added to publication
END $$;