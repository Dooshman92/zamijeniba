/*
  # Allow Admins and Moderators to View All Cars

  1. Changes
    - Add new RLS policy for admins and moderators to view ALL cars regardless of status
    - This allows admin panel to show all cars including inactive and hidden ones
  
  2. Security
    - Only users with is_admin=true or is_moderator=true can view all cars
    - Regular users can still only see active cars or their own cars
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view active cars" ON cars;

-- Create new policy for regular users (active cars or own cars)
CREATE POLICY "Users can view active cars or own cars"
  ON cars FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  );

-- Allow anonymous users to view active cars
CREATE POLICY "Anonymous users can view active cars"
  ON cars FOR SELECT
  TO anon
  USING (status = 'active');