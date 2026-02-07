/*
  # Dodaj Security Audit Log Tabelu

  1. Nova Tabela
    - `security_audit_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - može biti null za anonimne pokušaje)
      - `action` (text) - vrsta akcije (login_failed, suspicious_activity, rate_limit_exceeded)
      - `ip_address` (text) - IP adresa korisnika
      - `user_agent` (text) - Browser/device info
      - `details` (jsonb) - dodatni detalji o događaju
      - `created_at` (timestamp)

  2. Sigurnost
    - Enable RLS na tabeli
    - Samo admini mogu čitati logove
    - Sistema može upisivati logove (bez RLS za INSERT)
  
  3. Indeksi
    - Index na `user_id` za brže pretraživanje
    - Index na `action` za filtriranje po tipu
    - Index na `created_at` za sortiranje po vremenu
  
  4. Automatsko Brisanje Starih Logova
    - Automatski briše logove starije od 90 dana
*/

-- Kreiraj security_audit_log tabelu
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Dodaj indekse za performanse
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Samo admini mogu čitati logove
CREATE POLICY "Admins can read audit logs"
  ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Policy: Sistema može upisivati logove (koristićemo service role key)
CREATE POLICY "System can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Funkcija za automatsko brisanje starih logova (90 dana)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM security_audit_log
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Možeš pokrenuti ovu funkciju ručno ili postaviti cron job u Supabase dashboardu