/*
  # Drop phone_reveals table

  This migration removes the phone_reveals table as the phone reveal functionality
  has been changed. Phone numbers are now visible in two cases:
  1. When the user has set show_phone_number = true in their profile (public)
  2. When two users have an accepted swap offer between their cars

  ## Changes
  - Drop phone_reveals table
  - All associated policies and triggers are automatically removed
*/

DROP TABLE IF EXISTS phone_reveals CASCADE;