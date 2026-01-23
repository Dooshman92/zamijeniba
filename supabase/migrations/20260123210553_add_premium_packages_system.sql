/*
  # Add Premium Package System with Auto-Expiry

  1. Changes
    - Add `premium_package_days` column to track package duration (3, 5, 10, 15, 30 days)
    - Create function to check and expire premium users automatically
    - Create trigger to run expiry check on user updates
    - Add index on premium_expires_at for better performance

  2. Security
    - Function runs with security definer privileges
    - Maintains existing RLS policies
*/

-- Add premium package days column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS premium_package_days integer DEFAULT NULL;

-- Create index for better performance on premium expiry queries
CREATE INDEX IF NOT EXISTS idx_premium_expires_at 
ON user_profiles(premium_expires_at) 
WHERE is_premium = true;

-- Function to automatically expire premium on row update
CREATE OR REPLACE FUNCTION check_and_expire_premium()
RETURNS trigger
SECURITY DEFINER
AS $$
BEGIN
  -- If premium is enabled and has expiry date
  IF NEW.is_premium = true AND NEW.premium_expires_at IS NOT NULL THEN
    -- Check if premium has expired
    IF NEW.premium_expires_at < NOW() THEN
      NEW.is_premium := false;
      NEW.premium_package_days := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run on every update
DROP TRIGGER IF EXISTS trigger_expire_premium ON user_profiles;
CREATE TRIGGER trigger_expire_premium
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_and_expire_premium();

-- Function to batch expire all expired premium users (can be called manually or via cron)
CREATE OR REPLACE FUNCTION expire_all_premium_users()
RETURNS integer
SECURITY DEFINER
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE user_profiles
  SET 
    is_premium = false,
    premium_package_days = NULL
  WHERE 
    is_premium = true 
    AND premium_expires_at IS NOT NULL 
    AND premium_expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;