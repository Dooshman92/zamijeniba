/*
  # Popravljanje Admin Policy za Pregled Korisnika
  
  1. Problem
    - Trenutna policy "Admins can view all profiles" gleda `is_admin` kolonu na redu koji se čita
    - Treba da provjeri da li trenutni korisnik ima admin status
  
  2. Rješenje
    - Briši staru neispravnu policy
    - Kreiraj novu policy koja ispravno provjerava da li je trenutni prijavljeni korisnik admin
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
        AND user_profiles.is_admin = true
    )
  );
