/*
  # Fix conversation_participants foreign key to point to user_profiles
  
  1. Problem
    - conversation_participants.user_id references auth.users instead of user_profiles
    - This breaks Supabase joins using user_profiles(...) syntax
    - Causes 400 errors when fetching participant data with profile info
    
  2. Solution
    - Drop existing foreign key to auth.users
    - Add new foreign key to user_profiles table
    
  3. Security
    - No RLS changes needed
    - Maintains referential integrity with correct table
*/

-- Drop existing foreign key to auth.users
ALTER TABLE conversation_participants
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;

-- Add new foreign key to user_profiles
ALTER TABLE conversation_participants
ADD CONSTRAINT conversation_participants_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;