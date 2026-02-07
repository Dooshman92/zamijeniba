/*
  # Dodavanje globalne tabele za sistemske opcije
  
  1. Nova tabela
    - `system_settings`
      - `id` (uuid, primary key)
      - `credits_enabled` (boolean) - da li je sistem kredita omogućen
      - `updated_at` (timestamp)
      - `updated_by` (uuid) - admin koji je promenio opciju
  
  2. Sigurnost
    - Enable RLS za `system_settings` tabelu
    - Samo admini mogu da čitaju i menjaju opcije
    - Svi mogu da vide da li je sistem kredita omogućen (za proveru u UI)
  
  3. Inicijalizacija
    - Kreiranje jednog reda sa podrazumevanim vrednostima
    - `credits_enabled` = true (omogućeno po default-u)
*/

-- Kreiranje tabele za sistemske opcije
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credits_enabled boolean DEFAULT true NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES user_profiles(id)
);

-- Omogućavanje RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Svi autentifikovani korisnici mogu da vide sistemske opcije
CREATE POLICY "Authenticated users can view system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Samo admini mogu da ažuriraju sistemske opcije
CREATE POLICY "Only admins can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Insertovanje inicijalnog reda sa podrazumevanim vrednostima
INSERT INTO system_settings (id, credits_enabled, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Function za automatsko ažuriranje updated_at polja
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger za automatsko ažuriranje updated_at
DROP TRIGGER IF EXISTS update_system_settings_timestamp ON system_settings;
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();
