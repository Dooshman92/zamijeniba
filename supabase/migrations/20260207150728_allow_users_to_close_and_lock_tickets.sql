/*
  # Allow Users to Close and Lock Their Own Tickets

  1. Changes
    - Add policy for users to update status and locked fields on their own tickets
    - Users can only set status to 'closed'
    - When users close tickets, they automatically get locked
    - Users cannot unlock tickets (only admins/moderators can unlock)
  
  2. Behavior
    - Users can close their own tickets if they resolved the problem
    - Closing automatically locks the ticket for 3 days before deletion
    - Users cannot reopen or unlock tickets once closed
  
  3. Security
    - Users can only modify their own tickets
    - Users can only close (not change to other statuses)
    - Users cannot unlock tickets
*/

-- Add policy for users to close and lock their own tickets
CREATE POLICY "Users can close their own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'closed'
    AND locked = true
    AND locked_at IS NOT NULL
    AND locked_by = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  );