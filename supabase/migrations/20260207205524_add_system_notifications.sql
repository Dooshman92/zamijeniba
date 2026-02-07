/*
  # Add system notifications feature

  1. New Tables
    - `system_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - if null, notification is for all users
      - `title` (text) - notification title
      - `message` (text) - notification content
      - `type` (text) - notification type: 'info', 'warning', 'success', 'error', 'announcement'
      - `is_read` (boolean) - default false
      - `sent_by_admin_id` (uuid, nullable) - admin who sent the notification
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, nullable) - when notification should be auto-deleted
    
  2. Security
    - Enable RLS on `system_notifications` table
    - Users can only read their own notifications or global notifications (user_id is null)
    - Only admins can create/delete notifications
    - Users can mark their own notifications as read
    
  3. Functions
    - Auto-delete expired notifications
*/

-- Create system_notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE DEFAULT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'announcement')),
  is_read boolean DEFAULT false,
  sent_by_admin_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_notifications_user_id ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON system_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_notifications_is_read ON system_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_system_notifications_expires_at ON system_notifications(expires_at);

-- Enable RLS
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications or global notifications
CREATE POLICY "Users can read their notifications"
  ON system_notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Policy: Only admins can create notifications
CREATE POLICY "Admins can create notifications"
  ON system_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can mark notifications as read"
  ON system_notifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR user_id IS NULL
  )
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

-- Policy: Only admins can delete notifications
CREATE POLICY "Admins can delete notifications"
  ON system_notifications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Function to delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM system_notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$;

-- Schedule cleanup job to run every hour
SELECT cron.unschedule('delete-expired-notifications')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'delete-expired-notifications'
);

SELECT cron.schedule(
  'delete-expired-notifications',
  '0 * * * *',
  'SELECT delete_expired_notifications();'
);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE system_notifications;