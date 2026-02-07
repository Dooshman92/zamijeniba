/*
  # Enable Realtime for Notification Read Status

  ## Changes
  Enable realtime replication for the notification_read_status table
  so that read status updates are immediately reflected in the UI.
*/

-- Enable realtime for notification_read_status table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_read_status;
