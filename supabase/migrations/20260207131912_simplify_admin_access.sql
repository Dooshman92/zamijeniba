/*
  # Pojednostavljenje Admin Pristupa

  1. Problem
    - is_admin() funkcija kreira rekurziju sa RLS policies
    - Admin panel ne može da učita korisnike
  
  2. Rešenje
    - Obriši problematičnu admin policy
    - Svi korisnici mogu da vide osnovne profile (već postoji "Anyone can view profiles")
    - Admin provera se radi na application nivou
*/

-- Obriši problematičnu policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Obriši funkciju koja pravi rekurziju
DROP FUNCTION IF EXISTS is_admin();

-- Ažuriraj "Anyone can view profiles" policy da bude sigurno aktivna
DROP POLICY IF EXISTS "Anyone can view profiles" ON user_profiles;

CREATE POLICY "Anyone can view profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);