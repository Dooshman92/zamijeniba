/*
  # Add conversation_id to swap_offers table

  1. Changes
    - Add `conversation_id` column to `swap_offers` table to track which conversation belongs to which swap offer
    - This allows linking accepted swap offers to their chat conversations
    - Enables displaying offer-specific chat history

  2. Notes
    - The field is nullable because existing offers may not have conversations yet
    - Only accepted offers will have a conversation_id populated
*/

-- Add conversation_id column to swap_offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'swap_offers' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE swap_offers ADD COLUMN conversation_id text;
  END IF;
END $$;