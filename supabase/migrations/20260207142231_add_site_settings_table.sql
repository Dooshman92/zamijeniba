/*
  # Kreiranje tabele za globalne site opcije
  
  1. Nova tabela
    - `site_settings`
      - `id` (text, primary key) - jedinstveni ID za svaku opciju
      - `value` (boolean) - vrednost opcije
      - `updated_at` (timestamp)
      - `updated_by` (uuid) - admin koji je promenio opciju
  
  2. Sigurnost
    - Enable RLS za `site_settings` tabelu
    - Svi autentifikovani korisnici mogu da vide opcije
    - Samo admini mogu da ažuriraju opcije
  
  3. Inicijalizacija
    - Kreiranje reda za `premium_enabled` sa default vrednošću false
*/

-- Kreiranje tabele za site opcije
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES user_profiles(id)
);

-- Omogućavanje RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Svi autentifikovani korisnici mogu da vide site opcije
CREATE POLICY "Authenticated users can view site settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Samo admini mogu da ažuriraju site opcije
CREATE POLICY "Only admins can update site settings"
  ON site_settings
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

-- Insertovanje inicijalne vrednosti za premium_enabled (false po defaultu)
INSERT INTO site_settings (id, value, updated_at)
VALUES ('premium_enabled', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Function za automatsko ažuriranje updated_at polja
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger za automatsko ažuriranje updated_at
DROP TRIGGER IF EXISTS update_site_settings_timestamp ON site_settings;
CREATE TRIGGER update_site_settings_timestamp
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();
