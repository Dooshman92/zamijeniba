/*
  # Anti-Spam i Bot Detection Sistem

  1. Nova Tabela
    - `spam_detection_log`
      - `id` (uuid, primary key)
      - `email` (text) - email koji je pokušao registraciju
      - `ip_address` (text) - IP adresa
      - `user_agent` (text) - Browser info
      - `detection_type` (text) - tip detekcije (honeypot, too_fast, suspicious_email, etc.)
      - `honeypot_triggered` (boolean) - Da li je honeypot ispunjen
      - `form_submit_time_ms` (integer) - Vrijeme od otvaranja forme do submita
      - `recaptcha_score` (numeric) - reCAPTCHA score (ako je dostupan)
      - `blocked` (boolean) - Da li je pokušaj blokiran
      - `details` (jsonb) - dodatni detalji
      - `created_at` (timestamp)

  2. Sigurnost
    - Enable RLS
    - Samo admini mogu čitati logove
    - System može upisivati (service role)

  3. Indeksi
    - Index na `email` za pretraživanje
    - Index na `ip_address` za detekciju multiple pokušaja
    - Index na `detection_type` za analizu
    - Index na `created_at` za sortiranje

  4. Funkcije
    - Automatsko brisanje starih logova (30 dana)
    - Funkcija za provjeru da li je IP/email blokiran
*/

-- Kreiraj spam_detection_log tabelu
CREATE TABLE IF NOT EXISTS spam_detection_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  ip_address text,
  user_agent text,
  detection_type text NOT NULL,
  honeypot_triggered boolean DEFAULT false,
  form_submit_time_ms integer,
  recaptcha_score numeric,
  blocked boolean DEFAULT true,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Dodaj indekse
CREATE INDEX IF NOT EXISTS idx_spam_detection_email ON spam_detection_log(email);
CREATE INDEX IF NOT EXISTS idx_spam_detection_ip ON spam_detection_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_spam_detection_type ON spam_detection_log(detection_type);
CREATE INDEX IF NOT EXISTS idx_spam_detection_created ON spam_detection_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spam_detection_blocked ON spam_detection_log(blocked) WHERE blocked = true;

-- Enable RLS
ALTER TABLE spam_detection_log ENABLE ROW LEVEL SECURITY;

-- Policy: Samo admini mogu čitati spam logove
CREATE POLICY "Admins can read spam detection logs"
  ON spam_detection_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Policy: System može upisivati logove
CREATE POLICY "System can insert spam detection logs"
  ON spam_detection_log
  FOR INSERT
  WITH CHECK (true);

-- Funkcija za provjeru da li je email/IP suspendovan zbog spam-a
CREATE OR REPLACE FUNCTION is_spam_blocked(
  p_email text DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recent_blocks integer;
BEGIN
  -- Provjeri da li je email ili IP blokiran u zadnjih 24h
  SELECT COUNT(*)
  INTO v_recent_blocks
  FROM spam_detection_log
  WHERE blocked = true
    AND created_at > NOW() - INTERVAL '24 hours'
    AND (
      (p_email IS NOT NULL AND email = p_email) OR
      (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
    );

  -- Ako ima više od 3 blokiranja u 24h, blokiraj dodatno
  RETURN v_recent_blocks >= 3;
END;
$$;

-- Funkcija za čišćenje starih spam logova (30 dana)
CREATE OR REPLACE FUNCTION cleanup_spam_detection_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM spam_detection_log
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Funkcija za statistiku spam pokušaja
CREATE OR REPLACE FUNCTION get_spam_statistics(days_back integer DEFAULT 7)
RETURNS TABLE(
  detection_type text,
  count bigint,
  blocked_count bigint,
  unique_emails bigint,
  unique_ips bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sdl.detection_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE sdl.blocked = true) as blocked_count,
    COUNT(DISTINCT sdl.email) as unique_emails,
    COUNT(DISTINCT sdl.ip_address) as unique_ips
  FROM spam_detection_log sdl
  WHERE sdl.created_at > NOW() - (days_back || ' days')::interval
  GROUP BY sdl.detection_type
  ORDER BY count DESC;
END;
$$;

-- Dodaj komentar na tabelu
COMMENT ON TABLE spam_detection_log IS 'Loguje sve pokušaje spam-a i bot aktivnosti za analizu i prevenciju';
COMMENT ON COLUMN spam_detection_log.detection_type IS 'Tipovi: honeypot, too_fast, suspicious_email, rate_limit, suspicious_pattern';
COMMENT ON COLUMN spam_detection_log.form_submit_time_ms IS 'Vrijeme u milisekundama od otvaranja forme do submita';
COMMENT ON COLUMN spam_detection_log.recaptcha_score IS 'reCAPTCHA v3 score (0.0-1.0), niže = sumnjivije';