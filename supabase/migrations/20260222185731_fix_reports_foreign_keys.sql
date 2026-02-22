/*
  # Fix Reports Table Foreign Keys

  1. Changes
    - Add missing foreign key constraint for `reported_by` column to reference `user_profiles(id)`
    - This will enable proper JOIN operations in AdminDashboard queries
  
  2. Notes
    - The foreign key will enable Supabase to automatically resolve relationships
    - This fixes the issue where reports don't display properly in the admin panel
*/

-- Add foreign key for reported_by column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reports_reported_by_fkey'
    AND table_name = 'reports'
  ) THEN
    ALTER TABLE reports
    ADD CONSTRAINT reports_reported_by_fkey
    FOREIGN KEY (reported_by) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
