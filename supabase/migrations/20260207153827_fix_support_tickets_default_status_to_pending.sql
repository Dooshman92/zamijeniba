/*
  # Fix Support Tickets Default Status

  1. Changes
    - Change default status from 'open' to 'pending'
    - When users create tickets, they should start as 'pending'
    - Admin/moderator opens them by changing status to 'open'

  2. Behavior
    - New tickets start with status 'pending' (waiting for staff)
    - When staff views a ticket, it automatically changes to 'open'
    - Staff can then move it to 'in_progress', 'resolved', or 'closed'
*/

-- Drop existing constraint and add new one with 'pending' as default
ALTER TABLE support_tickets 
  DROP CONSTRAINT IF EXISTS support_tickets_status_check;

ALTER TABLE support_tickets 
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE support_tickets 
  ADD CONSTRAINT support_tickets_status_check 
  CHECK (status IN ('pending', 'open', 'in_progress', 'resolved', 'closed'));
