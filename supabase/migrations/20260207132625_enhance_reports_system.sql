/*
  # Poboljšanje Sistema za Reporte

  1. Ažuriranje postojeće tabele
    - Dodavanje kolona za prijavu korisnika
    - Dodavanje kolona za moderaciju
    - Dodavanje statusa pregleda
  
  2. Security
    - Ažuriranje RLS politika za admine i moderatore
*/

-- Dodaj nove kolone
DO $$ 
BEGIN
  -- Dodaj reported_user_id ako ne postoji
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reported_user_id'
  ) THEN
    ALTER TABLE reports ADD COLUMN reported_user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  -- Dodaj reviewed_by ako ne postoji
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE reports ADD COLUMN reviewed_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;

  -- Dodaj reviewed_at ako ne postoji
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE reports ADD COLUMN reviewed_at timestamptz;
  END IF;

  -- Dodaj resolution_notes ako ne postoji
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'resolution_notes'
  ) THEN
    ALTER TABLE reports ADD COLUMN resolution_notes text;
  END IF;
END $$;

-- Ažuriraj status constraint da ima sve statuse
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE reports ADD CONSTRAINT reports_status_check 
  CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Postavi default status ako nije
ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE reports ALTER COLUMN status SET NOT NULL;

-- Kreiraj indekse za brže pretrage
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_car_id ON reports(car_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Obriši stare policies
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Admins and moderators can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins and moderators can update reports" ON reports;

-- Nova policy: Korisnici mogu da kreiraju reporte
CREATE POLICY "Users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

-- Nova policy: Korisnici mogu da vide svoje reporte
CREATE POLICY "Users can view own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reported_by);

-- Nova policy: Admini i moderatori mogu da vide sve reporte
CREATE POLICY "Admins and moderators can view all reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  );

-- Nova policy: Admini i moderatori mogu da ažuriraju reporte
CREATE POLICY "Admins and moderators can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  );