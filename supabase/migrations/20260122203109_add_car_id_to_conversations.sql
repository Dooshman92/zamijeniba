/*
  # Add Car Reference to Conversations

  1. Modifications
    - Add `car_id` column to `conversations` table
    - Foreign key references `cars(id)` for which car the conversation is about

  2. Purpose
    - Track which car listing a conversation is about
    - Display car details in chat interface
    - Help users identify conversations by the car they're discussing

  3. Notes
    - Column is nullable since existing conversations may not have car references
    - New conversations should include car_id when initiated from a car listing
*/

-- Add car_id column to conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'car_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN car_id uuid REFERENCES cars(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_car_id ON conversations(car_id);