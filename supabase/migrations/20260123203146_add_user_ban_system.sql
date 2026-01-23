/*
  # User Ban System

  1. New Fields on user_profiles
    - `is_banned` (boolean) - Whether the user is currently banned
    - `ban_reason` (text) - Reason for the ban
    - `banned_at` (timestamptz) - When the user was banned
    - `banned_by` (uuid) - Admin who banned the user
    - `ban_expires_at` (timestamptz) - Optional expiration date for temporary bans

  2. Security
    - Only admins can modify ban fields
    - Banned users cannot create/update cars, swap offers, messages, or inquiries
    - Banned users can still view their own profile

  3. Notes
    - Adds comprehensive ban tracking
    - Supports both permanent and temporary bans
    - Includes audit trail for who banned whom
*/

-- Add ban-related columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_banned boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'ban_reason'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN ban_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'banned_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN banned_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'banned_by'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN banned_by uuid REFERENCES user_profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'ban_expires_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN ban_expires_at timestamptz;
  END IF;
END $$;

-- Function to check if a user is currently banned
CREATE OR REPLACE FUNCTION is_user_banned(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND is_banned = true
    AND (ban_expires_at IS NULL OR ban_expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire temporary bans
CREATE OR REPLACE FUNCTION auto_expire_bans()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET is_banned = false,
      ban_reason = NULL,
      banned_at = NULL,
      banned_by = NULL,
      ban_expires_at = NULL
  WHERE is_banned = true
  AND ban_expires_at IS NOT NULL
  AND ban_expires_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy to prevent banned users from creating cars
DROP POLICY IF EXISTS "Users can create cars" ON cars;
CREATE POLICY "Users can create cars"
  ON cars
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT is_user_banned(auth.uid())
  );

-- Create policy to prevent banned users from updating cars
DROP POLICY IF EXISTS "Users can update own cars" ON cars;
CREATE POLICY "Users can update own cars"
  ON cars
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND NOT is_user_banned(auth.uid())
  );

-- Create policy to prevent banned users from creating swap offers
DROP POLICY IF EXISTS "Authenticated users can create swap offers" ON swap_offers;
CREATE POLICY "Authenticated users can create swap offers"
  ON swap_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_user_banned(auth.uid())
  );

-- Create policy to prevent banned users from sending messages
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
    AND NOT is_user_banned(auth.uid())
  );

-- Create policy to prevent banned users from creating live inquiries
DROP POLICY IF EXISTS "Authenticated users can create inquiries" ON live_inquiries;
CREATE POLICY "Authenticated users can create inquiries"
  ON live_inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT is_user_banned(auth.uid())
  );

-- Add policy for admins to update ban status
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );