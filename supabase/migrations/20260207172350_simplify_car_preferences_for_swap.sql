/*
  # Simplify Car Preferences for Swap

  1. Changes
    - Add `preferred_vehicle_type` (text) - Type of vehicle user prefers for swap
    - Add `preferred_brand` (text) - Brand user prefers (or "Razno" for any)
    - Add `preferred_model` (text) - Model user prefers (or "Razno" for any)
    - Remove `preferred_brands` array - simplified to single brand/model selection
    - Remove `preferred_fuel_types` array - not needed with new approach
    - Keep year range, mileage, and price difference fields

  2. Notes
    - Users can now select a specific vehicle category (automobil, motocikl, etc.)
    - They can choose a specific brand and model, or select "Razno" (Any) for either
    - This makes preferences clearer and easier to display on ads
    - Example: "Preferiram zamjenu za Automobil BMW X5" or "Preferiram zamjenu za Motocikl - Razno"
*/

-- Add new columns to car_preferences
DO $$
BEGIN
  -- Add preferred_vehicle_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'car_preferences' AND column_name = 'preferred_vehicle_type'
  ) THEN
    ALTER TABLE car_preferences ADD COLUMN preferred_vehicle_type text;
  END IF;

  -- Add preferred_brand
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'car_preferences' AND column_name = 'preferred_brand'
  ) THEN
    ALTER TABLE car_preferences ADD COLUMN preferred_brand text;
  END IF;

  -- Add preferred_model
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'car_preferences' AND column_name = 'preferred_model'
  ) THEN
    ALTER TABLE car_preferences ADD COLUMN preferred_model text;
  END IF;

  -- Drop old columns if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'car_preferences' AND column_name = 'preferred_brands'
  ) THEN
    ALTER TABLE car_preferences DROP COLUMN preferred_brands;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'car_preferences' AND column_name = 'preferred_fuel_types'
  ) THEN
    ALTER TABLE car_preferences DROP COLUMN preferred_fuel_types;
  END IF;
END $$;
