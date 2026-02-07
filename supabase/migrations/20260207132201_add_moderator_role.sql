/*
  # Dodavanje Moderatorske Uloge

  1. Nove Kolone
    - `is_moderator` (boolean) - Da li je korisnik moderator
  
  2. Opis
    - Moderatori imaju ograničen pristup u odnosu na admine
    - Administrator može da dodeljuje moderatorsku ulogu
    - Moderatori ne mogu da upravljaju drugim moderatorima ili adminima
*/

-- Dodaj is_moderator kolonu
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false NOT NULL;

-- Kreiraj indeks za brže pretrage
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_moderator ON user_profiles(is_moderator);

-- Ažuriraj policy za update da admini mogu da menjaju moderator status
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );