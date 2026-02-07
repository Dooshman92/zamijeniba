/*
  # Prevent Admins and Moderators from Creating Support Tickets

  1. Changes
    - Update the "Users can create tickets" policy to exclude admins and moderators
    - Only regular users (non-admin, non-moderator) can create support tickets
    
  2. Security
    - Admins and moderators should use the Support Panel to manage tickets, not create their own
    - This prevents confusion and ensures proper support workflow
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;

-- Create updated policy that excludes admins and moderators
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  );
