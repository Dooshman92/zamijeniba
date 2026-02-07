/*
  # Omogući Moderatorima Brisanje Automobila

  1. Nova Policy
    - Admini i moderatori mogu brisati automobile
*/

-- Policy: Admini i moderatori mogu brisati automobile
DROP POLICY IF EXISTS "Admins and moderators can delete cars" ON cars;

CREATE POLICY "Admins and moderators can delete cars"
  ON cars
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND (user_profiles.is_admin = true OR user_profiles.is_moderator = true)
    )
  );