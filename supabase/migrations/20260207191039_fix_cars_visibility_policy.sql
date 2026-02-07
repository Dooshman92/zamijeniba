/*
  # Fix Cars Visibility Policy

  1. Changes
    - Drop old policies and create a unified policy
    - Allow everyone to see active cars
    - Allow admins and moderators to see ALL cars
    - Allow users to see their own cars regardless of status
  
  2. Security
    - Uses a single policy with OR conditions
    - Covers all user types: anon, authenticated, admin, moderator
*/

-- Drop all existing SELECT policies on cars
DROP POLICY IF EXISTS "Users can view active cars or own cars" ON cars;
DROP POLICY IF EXISTS "Anonymous users can view active cars" ON cars;

-- Create a unified policy that covers all cases
CREATE POLICY "View cars based on role and status"
  ON cars FOR SELECT
  USING (
    status = 'active'
    OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
      )
    )
  );