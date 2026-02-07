/*
  # Popravljanje Admin Panel Pristupa

  1. Problem
    - RLS policy za admin proveru kreira rekurziju
    - Korisnici ne mogu da vide svoj is_admin status
  
  2. Rešenje
    - Dodaj policy koja omogućava korisnicima da vide svoj sopstveni profil
    - Koristi jednostavniju admin policy bez rekurzije
*/

-- Prvo, obriši postojeću rekurzivnu policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Dodaj jednostavnu policy koja omogućava korisnicima da vide svoj profil
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Kreiraj novu policy za admine koja koristi security definer funkciju
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nova admin policy koja koristi security definer funkciju
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());