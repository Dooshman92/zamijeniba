/*
  # Add First Free Action Tracking
  
  1. Changes
    - Add `first_car_ad_used` column to `user_profiles` table
      - Tracks if user has used their first free car ad
      - Defaults to false
    - Add `first_swap_offer_used` column to `user_profiles` table
      - Tracks if user has used their first free swap offer
      - Defaults to false
  
  2. Purpose
    - Enables credit system where first car ad is free (rest cost 5 credits)
    - Enables credit system where first swap offer is free (rest cost 1 credit)
    - Premium users bypass all credit costs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'first_car_ad_used'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN first_car_ad_used boolean DEFAULT false NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'first_swap_offer_used'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN first_swap_offer_used boolean DEFAULT false NOT NULL;
  END IF;
END $$;
