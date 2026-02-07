/*
  # Add automatic deletion of blocked conversations after 48 hours

  1. Changes
    - Add `blocked_at` column to `conversations` table to track when conversation was blocked
    - Create function to delete blocked conversations older than 48 hours
    - Enable pg_cron extension
    - Set up cron job to run cleanup every hour

  2. Security
    - Function only deletes conversations that were blocked more than 48 hours ago
    - Cascading deletes will remove related messages, participants, and swap offers
*/

-- Add blocked_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'blocked_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN blocked_at timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Create function to delete old blocked conversations
CREATE OR REPLACE FUNCTION delete_old_blocked_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete conversations that were blocked more than 48 hours ago
  DELETE FROM conversations
  WHERE blocked_by_user_id IS NOT NULL
    AND blocked_at IS NOT NULL
    AND blocked_at < NOW() - INTERVAL '48 hours';
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup job to run every hour
-- First, remove the job if it already exists
SELECT cron.unschedule('delete-old-blocked-conversations')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'delete-old-blocked-conversations'
);

-- Create the cron job
SELECT cron.schedule(
  'delete-old-blocked-conversations',
  '0 * * * *', -- Run every hour at minute 0
  'SELECT delete_old_blocked_conversations();'
);