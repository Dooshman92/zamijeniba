/*
  # Dodaj Sigurnosne Mjere za Passworde

  1. Nova Tabela
    - `password_reset_attempts`
      - Prati pokušaje resetovanja lozinke
      - Rate limiting na serverskoj strani
  
  2. Sigurnost
    - Spriječava brute force napade na password reset
    - Loguje sve pokušaje
*/

-- Kreiraj password_reset_attempts tabelu
CREATE TABLE IF NOT EXISTS password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempts_count integer DEFAULT 1,
  last_attempt_at timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index za brze pretraživanje
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_attempts(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_blocked ON password_reset_attempts(blocked_until) WHERE blocked_until IS NOT NULL;

-- Enable RLS
ALTER TABLE password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Niko ne može čitati pokušaje osim admina
CREATE POLICY "Only admins can read password reset attempts"
  ON password_reset_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Policy: Sistema može upisivati pokušaje
CREATE POLICY "System can track password reset attempts"
  ON password_reset_attempts
  FOR INSERT
  WITH CHECK (true);

-- Policy: Sistema može ažurirati pokušaje
CREATE POLICY "System can update password reset attempts"
  ON password_reset_attempts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Funkcija za provjeru da li je email blokiran
CREATE OR REPLACE FUNCTION is_password_reset_blocked(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_blocked_until timestamptz;
  v_attempts integer;
BEGIN
  SELECT blocked_until, attempts_count
  INTO v_blocked_until, v_attempts
  FROM password_reset_attempts
  WHERE email = p_email
  ORDER BY last_attempt_at DESC
  LIMIT 1;

  IF v_blocked_until IS NOT NULL AND v_blocked_until > NOW() THEN
    RETURN true;
  END IF;

  IF v_attempts >= 5 THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Funkcija za čišćenje starih pokušaja (starijih od 24h)
CREATE OR REPLACE FUNCTION cleanup_password_reset_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM password_reset_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$;