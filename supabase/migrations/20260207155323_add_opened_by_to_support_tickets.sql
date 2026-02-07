/*
  # Add opened_by field to support_tickets
  
  1. Changes
    - Add `opened_by` column to `support_tickets` table
      - Tracks which admin/moderator opened the ticket (changed status from pending to open)
      - References auth.users(id)
      - Nullable (only set when ticket is opened by staff)
    - Add `opened_at` column to track when ticket was opened
      - Timestamptz, nullable
*/

-- Add opened_by column to track which staff member opened the ticket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'opened_by'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN opened_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add opened_at column to track when ticket was opened
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'opened_at'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN opened_at timestamptz;
  END IF;
END $$;