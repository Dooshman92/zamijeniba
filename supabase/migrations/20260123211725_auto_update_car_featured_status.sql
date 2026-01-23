/*
  # Auto-Update Car Featured Status

  1. Changes
    - Create function to update all cars' featured status when user premium status changes
    - Create trigger to automatically call this function on user_profiles updates
    
  2. Purpose
    - When a user becomes premium, all their cars become featured
    - When a user's premium expires, all their cars lose featured status
    - Featured until timestamp matches user's premium expiry
  
  3. Security
    - Function runs with security definer privileges
    - Maintains existing RLS policies
*/

-- Function to update cars' featured status when user premium changes
CREATE OR REPLACE FUNCTION update_user_cars_featured_status()
RETURNS trigger
SECURITY DEFINER
AS $$
BEGIN
  -- If premium status changed or premium_expires_at changed
  IF (NEW.is_premium != OLD.is_premium) OR (NEW.premium_expires_at IS DISTINCT FROM OLD.premium_expires_at) THEN
    -- Update all user's cars
    UPDATE cars
    SET 
      is_featured = NEW.is_premium,
      featured_until = CASE 
        WHEN NEW.is_premium = true THEN NEW.premium_expires_at
        ELSE NULL
      END,
      priority_score = CASE 
        WHEN NEW.is_premium = true THEN 100
        ELSE 0
      END
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run on user_profiles updates
DROP TRIGGER IF EXISTS trigger_update_cars_featured_status ON user_profiles;
CREATE TRIGGER trigger_update_cars_featured_status
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_cars_featured_status();