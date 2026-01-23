/*
  # Add Car Equipment and Features

  1. Modifications
    - Add equipment fields to `cars` table for various car features
    
  2. New Fields
    - `xenon_lights` (boolean) - Xenon/LED headlights
    - `heated_seats` (boolean) - Heated front seats
    - `leather_seats` (boolean) - Leather upholstery
    - `sunroof` (boolean) - Panoramic sunroof
    - `parking_sensors` (boolean) - Front/rear parking sensors
    - `parking_camera` (boolean) - Rear view camera
    - `navigation` (boolean) - Built-in navigation system
    - `bluetooth` (boolean) - Bluetooth connectivity
    - `cruise_control` (boolean) - Cruise control
    - `climate_control` (boolean) - Automatic climate control
    - `alloy_wheels` (boolean) - Alloy wheels
    - `fog_lights` (boolean) - Fog lights
    - `roof_rack` (boolean) - Roof rack
    - `tow_hitch` (boolean) - Tow hitch
    - `sport_package` (boolean) - Sport package
    - `winter_tires` (boolean) - Winter tires included
    - `summer_tires` (boolean) - Summer tires included
    - `spare_tire` (boolean) - Spare tire included
    
  3. Purpose
    - Allow sellers to specify car equipment and features
    - Help buyers filter and find cars with desired features
    - Provide comprehensive car information
    
  4. Notes
    - All fields default to false
    - Nullable for backwards compatibility with existing records
*/

-- Add equipment fields to cars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'xenon_lights'
  ) THEN
    ALTER TABLE cars 
    ADD COLUMN xenon_lights boolean DEFAULT false,
    ADD COLUMN heated_seats boolean DEFAULT false,
    ADD COLUMN leather_seats boolean DEFAULT false,
    ADD COLUMN sunroof boolean DEFAULT false,
    ADD COLUMN parking_sensors boolean DEFAULT false,
    ADD COLUMN parking_camera boolean DEFAULT false,
    ADD COLUMN navigation boolean DEFAULT false,
    ADD COLUMN bluetooth boolean DEFAULT false,
    ADD COLUMN cruise_control boolean DEFAULT false,
    ADD COLUMN climate_control boolean DEFAULT false,
    ADD COLUMN alloy_wheels boolean DEFAULT false,
    ADD COLUMN fog_lights boolean DEFAULT false,
    ADD COLUMN roof_rack boolean DEFAULT false,
    ADD COLUMN tow_hitch boolean DEFAULT false,
    ADD COLUMN sport_package boolean DEFAULT false,
    ADD COLUMN winter_tires boolean DEFAULT false,
    ADD COLUMN summer_tires boolean DEFAULT false,
    ADD COLUMN spare_tire boolean DEFAULT false;
  END IF;
END $$;