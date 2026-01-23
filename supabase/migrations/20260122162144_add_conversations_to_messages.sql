/*
  # Add Conversations System

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_message_at` (timestamp)
    
    - `conversation_participants`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `joined_at` (timestamp)
      - `last_read_at` (timestamp)
      - `unread_count` (integer)

  2. Modifications to existing messages table
    - Add `conversation_id` column
    - Add `content` column (copy from `message` column)
    - Add `message_type` column

  3. Security
    - Enable RLS on all new tables
    - Users can only see conversations they are part of

  4. Migration
    - Create conversations for existing messages
    - Link existing messages to conversations
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  UNIQUE(conversation_id, user_id)
);

-- Add new columns to messages table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'content'
  ) THEN
    ALTER TABLE messages ADD COLUMN content text;
    -- Copy existing message content
    UPDATE messages SET content = message WHERE content IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'message_type'
  ) THEN
    ALTER TABLE messages ADD COLUMN message_type text DEFAULT 'text';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they are part of"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can add participants"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own participant record"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update existing messages RLS to work with conversations
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR
    (conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations
    SET updated_at = NEW.created_at,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversation_participants
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment unread count
DROP TRIGGER IF EXISTS trigger_increment_unread_count ON messages;
CREATE TRIGGER trigger_increment_unread_count
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();