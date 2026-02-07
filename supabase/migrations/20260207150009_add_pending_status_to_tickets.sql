/*
  # Add Pending Status to Support Tickets

  1. Changes
    - Add 'pending' status to support_tickets status check constraint
    - Change default status from 'open' to 'pending'
    - Pending = ticket created but not yet viewed by staff
    - Open = ticket viewed and being handled by staff
  
  2. Why This Change
    - Users see "Open" status immediately when they create ticket, which is misleading
    - "Pending" status better represents tickets waiting for staff review
    - Staff can see which tickets are new vs already opened
*/

-- Drop existing constraint
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_status_check;

-- Add new constraint with 'pending' status
ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_status_check 
  CHECK (status IN ('pending', 'open', 'in_progress', 'resolved', 'closed'));

-- Update default status to 'pending'
ALTER TABLE support_tickets ALTER COLUMN status SET DEFAULT 'pending';

-- Update existing 'open' tickets that have no messages to 'pending'
-- (these are likely tickets that were never actually viewed by staff)
UPDATE support_tickets 
SET status = 'pending' 
WHERE status = 'open' 
AND NOT EXISTS (
  SELECT 1 FROM support_messages 
  WHERE support_messages.ticket_id = support_tickets.id 
  AND support_messages.is_staff_reply = true
);