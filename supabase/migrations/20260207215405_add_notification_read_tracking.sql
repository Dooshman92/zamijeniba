/*
  # Add Notification Read Status Tracking

  ## Problem
  Global notifications (user_id = null) share the same is_read status for all users.
  When one user marks it as read, it becomes read for everyone.

  ## Solution
  Create a separate table to track which user has read which notification.
  This allows each user to have their own read status for every notification,
  including global ones.

  ## Changes
  1. New Table: notification_read_status
     - notification_id (uuid, references system_notifications)
     - user_id (uuid, references user_profiles)
     - read_at (timestamp)
     - Primary key: (notification_id, user_id)
  
  2. Security
     - Enable RLS
     - Users can only see and manage their own read status
*/

-- Create notification read status tracking table
CREATE TABLE IF NOT EXISTS public.notification_read_status (
  notification_id uuid NOT NULL REFERENCES public.system_notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notification_read_status ENABLE ROW LEVEL SECURITY;

-- Users can view their own read status
CREATE POLICY "select_notification_read_status"
  ON public.notification_read_status FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own read status
CREATE POLICY "insert_notification_read_status"
  ON public.notification_read_status FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own read status (to mark as unread)
CREATE POLICY "delete_notification_read_status"
  ON public.notification_read_status FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_read_status_user_id 
  ON public.notification_read_status(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_read_status_notification_id 
  ON public.notification_read_status(notification_id);
