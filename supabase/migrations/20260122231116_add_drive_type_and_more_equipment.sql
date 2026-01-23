/*
  # Add Drive Type and Additional Equipment Fields

  1. Changes
    - Add `drive_type` column to cars table (Prednji, Zadnji, 4x4, AWD)
    - Add additional equipment fields:
      - `electric_windows` (boolean) - Električni podizači stakala
      - `electric_mirrors` (boolean) - Električna podešavanja retrovizora
      - `abs` (boolean) - ABS kočioni sistem
      - `esp` (boolean) - ESP stabilizacioni sistem
      - `airbags` (text) - Broj airbag-ova
      - `central_locking` (boolean) - Centralno zaključavanje
      - `alarm` (boolean) - Alarm
      - `immobilizer` (boolean) - Imobilajzer
      - `rain_sensor` (boolean) - Senzor za kišu
      - `light_sensor` (boolean) - Senzor za svjetlo
      - `tinted_windows` (boolean) - Zatamnjena stakla
      - `electric_seats` (boolean) - Električna sjedišta
      - `memory_seats` (boolean) - Memory sjedišta
      - `sport_seats` (boolean) - Sport sjedišta
      - `isofix` (boolean) - Isofix
      - `start_stop` (boolean) - Start/Stop sistem
      - `keyless_entry` (boolean) - Keyless Entry
      - `rear_parking_sensors` (boolean) - Zadnji parking senzori
      - `front_parking_sensors` (boolean) - Prednji parking senzori

  2. Notes
    - All new fields are optional (nullable)
    - drive_type defaults to null
*/

-- Add drive_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'drive_type'
  ) THEN
    ALTER TABLE cars ADD COLUMN drive_type text;
  END IF;
END $$;

-- Add additional equipment fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'electric_windows'
  ) THEN
    ALTER TABLE cars ADD COLUMN electric_windows boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'electric_mirrors'
  ) THEN
    ALTER TABLE cars ADD COLUMN electric_mirrors boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'abs'
  ) THEN
    ALTER TABLE cars ADD COLUMN abs boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'esp'
  ) THEN
    ALTER TABLE cars ADD COLUMN esp boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'airbags'
  ) THEN
    ALTER TABLE cars ADD COLUMN airbags text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'central_locking'
  ) THEN
    ALTER TABLE cars ADD COLUMN central_locking boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'alarm'
  ) THEN
    ALTER TABLE cars ADD COLUMN alarm boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'immobilizer'
  ) THEN
    ALTER TABLE cars ADD COLUMN immobilizer boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'rain_sensor'
  ) THEN
    ALTER TABLE cars ADD COLUMN rain_sensor boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'light_sensor'
  ) THEN
    ALTER TABLE cars ADD COLUMN light_sensor boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'tinted_windows'
  ) THEN
    ALTER TABLE cars ADD COLUMN tinted_windows boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'electric_seats'
  ) THEN
    ALTER TABLE cars ADD COLUMN electric_seats boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'memory_seats'
  ) THEN
    ALTER TABLE cars ADD COLUMN memory_seats boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'sport_seats'
  ) THEN
    ALTER TABLE cars ADD COLUMN sport_seats boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'isofix'
  ) THEN
    ALTER TABLE cars ADD COLUMN isofix boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'start_stop'
  ) THEN
    ALTER TABLE cars ADD COLUMN start_stop boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'keyless_entry'
  ) THEN
    ALTER TABLE cars ADD COLUMN keyless_entry boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'rear_parking_sensors'
  ) THEN
    ALTER TABLE cars ADD COLUMN rear_parking_sensors boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'front_parking_sensors'
  ) THEN
    ALTER TABLE cars ADD COLUMN front_parking_sensors boolean DEFAULT false;
  END IF;
END $$;