/*
  # Add Ticket Locking and Auto-Deletion System

  1. Changes
    - Add `locked` boolean field to support_tickets (default false)
    - Add `locked_at` timestamp field to support_tickets
    - Add `locked_by` user reference to track who locked the ticket
    - Create function to automatically delete tickets locked for 3+ days
    - Create trigger to run cleanup on ticket/message activity
  
  2. Behavior
    - Admins/moderators can lock tickets
    - Locked tickets are kept for 3 days then auto-deleted
    - Cleanup runs automatically when there's activity in support system
  
  3. Security
    - Only staff can lock tickets
    - Users can still view their locked tickets until they're deleted
*/

-- Add locked fields to support_tickets
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at timestamptz,
ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id);

-- Create function to delete tickets locked for 3+ days
CREATE OR REPLACE FUNCTION delete_old_locked_tickets()
RETURNS void AS $$
BEGIN
  DELETE FROM support_tickets
  WHERE locked = true
  AND locked_at IS NOT NULL
  AND locked_at < NOW() - INTERVAL '3 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to run cleanup
CREATE OR REPLACE FUNCTION trigger_cleanup_old_locked_tickets()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM delete_old_locked_tickets();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on support_tickets to run cleanup after INSERT
DROP TRIGGER IF EXISTS cleanup_locked_tickets_trigger ON support_tickets;
CREATE TRIGGER cleanup_locked_tickets_trigger
  AFTER INSERT ON support_tickets
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_old_locked_tickets();

-- Create trigger on support_messages to run cleanup after INSERT
DROP TRIGGER IF EXISTS cleanup_locked_tickets_on_message_trigger ON support_messages;
CREATE TRIGGER cleanup_locked_tickets_on_message_trigger
  AFTER INSERT ON support_messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_old_locked_tickets();

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_locked_at ON support_tickets(locked_at) WHERE locked = true;