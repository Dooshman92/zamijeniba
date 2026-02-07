/*
  # Dodavanje podrške za različite tipove vozila

  1. Izmjene
    - Dodaje enum tip `vehicle_type` sa vrijednostima:
      - 'automobil' (default)
      - 'motocikl'
      - 'quad'
      - 'motorne_sanke'
      - 'jetski'
    - Dodaje kolonu `vehicle_type` u `cars` tabelu sa default vrijednošću 'automobil'
    - Dodaje kolonu `engine_displacement` (kubikaza) za motocikle i quad-ove (u cm³)
    - Dodaje kolonu `hull_material` (materijal trupa) za jetski
    - Dodaje kolonu `track_length` (dužina gusenice) za motorne sanke (u cm)

  2. Napomene
    - Postojeći zapisi će automatski dobiti vehicle_type = 'automobil'
    - Sva vozila mogu biti zamijenjena međusobno bez obzira na tip
*/

-- Kreiranje enum tipa za tipove vozila
DO $$ BEGIN
  CREATE TYPE vehicle_type AS ENUM ('automobil', 'motocikl', 'quad', 'motorne_sanke', 'jetski');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Dodavanje kolone vehicle_type u cars tabelu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'vehicle_type'
  ) THEN
    ALTER TABLE cars ADD COLUMN vehicle_type vehicle_type DEFAULT 'automobil' NOT NULL;
  END IF;
END $$;

-- Dodavanje kolone za kubikažu (za motocikle, quad)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'engine_displacement'
  ) THEN
    ALTER TABLE cars ADD COLUMN engine_displacement INTEGER;
    COMMENT ON COLUMN cars.engine_displacement IS 'Kubikaza motora u cm³ (za motocikle i quad-ove)';
  END IF;
END $$;

-- Dodavanje kolone za materijal trupa (za jetski)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'hull_material'
  ) THEN
    ALTER TABLE cars ADD COLUMN hull_material TEXT;
    COMMENT ON COLUMN cars.hull_material IS 'Materijal trupa (za jetski)';
  END IF;
END $$;

-- Dodavanje kolone za dužinu gusenice (za motorne sanke)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'track_length'
  ) THEN
    ALTER TABLE cars ADD COLUMN track_length INTEGER;
    COMMENT ON COLUMN cars.track_length IS 'Dužina gusenice u cm (za motorne sanke)';
  END IF;
END $$;

-- Kreiranje indeksa za brže filtriranje po tipu vozila
CREATE INDEX IF NOT EXISTS idx_cars_vehicle_type ON cars(vehicle_type);