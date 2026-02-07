# Sigurnosna Lista za Produkciju

## Pre-Deployment Checklist

### 1. Environment Variables

```bash
# ✅ Provjerite da su postavljene sve environment varijable
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (JAVNI ključ - OK za frontend)
```

**VAŽNO:**
- ❌ NIKADA nemojte commit-ovati .env fajlove
- ✅ Koristite različite ključeve za development i production
- ✅ Rotirajte ključeve svakih 90 dana

### 2. Supabase Dashboard Konfiguracija

#### A. Authentication Settings
```
1. Otvori Supabase Dashboard
2. Idi na Authentication > Settings
3. Postavi:
   - Site URL: https://vašadomena.com
   - Redirect URLs: https://vašadomena.com/**
   - Enable Email Auth
   - Disable Auto Confirm (za produkciju)
```

#### B. Database RLS Provjera
```sql
-- Provjerite da sve tabele imaju RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Trebalo bi vratiti 0 rezultata!
```

#### C. Storage Policies
```
1. Otvori Storage
2. Provjerite car-images bucket:
   - Max file size: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
3. Provjerite avatars bucket:
   - Max file size: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
```

### 3. HTTPS i Domain Setup

```bash
# Osigurajte da je HTTPS forced
# Dodajte u production build config
```

**Netlify/Vercel:**
```
Force HTTPS: ✅ Enabled
HSTS: ✅ Enabled (max-age=31536000)
```

### 4. CSP Headers u Produkciji

Ažurirajte `netlify.toml` ili `vercel.json`:

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://www.google.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
```

### 5. Email Verification Setup (KRITIČNO!)

**OBAVEZNO za produkciju!**

```bash
1. Otvori Supabase Dashboard
2. Idi na Authentication > Settings
3. Enable Email Confirmations: ✅ ON
4. Confirm Email Template:
   - Subject: "Potvrdite vaš nalog na zamijeniauto.ba"
   - Dodaj logo i branding
5. Site URL: https://zamijeniauto.ba
6. Redirect URLs:
   - https://zamijeniauto.ba/**
   - https://zamijeniauto.ba/auth/confirm
7. SMTP Settings (optional ali preporučeno):
   - Koristi custom SMTP za bolji deliverability
   - Setup SPF, DKIM, DMARC records
```

**Testing Email Verification:**
```bash
1. Registruj test korisnika
2. Provjeri da email stiže (inbox i spam)
3. Klikni verification link
4. Provjeri da se korisnik može prijaviti
```

### 6. Google reCAPTCHA Setup (OBAVEZNO!)

**reCAPTCHA v2 Checkbox**

```bash
1. Idi na https://www.google.com/recaptcha/admin
2. Registruj novi site:
   - Tip: reCAPTCHA v2
   - Checkbox (ne Invisible)
3. Dodaj domene:
   - localhost (za development)
   - zamijeniauto.ba (produkcija)
4. Kopiraj Site Key i dodaj u .env:
   VITE_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXX
5. Secret Key ostaje na Google serveru (ne dodavaj u frontend!)
```

**Testing reCAPTCHA:**
```bash
1. Otvori registration formu
2. Provjeri da se reCAPTCHA checkbox prikazuje
3. Pokušaj registraciju bez checkboxa (trebalo bi da blokira)
4. Označi checkbox i submit (trebalo bi da prođe)
```

### 7. Anti-Spam Features Test

**Pre-production testing:**

```bash
# Test 1: Honeypot detection
- Pokušaj registraciju sa popunjenim honeypot fieldsom
- Expected: "Greška pri obradi"

# Test 2: Timing detection
- Submituj formu u manje od 3 sekunde
- Expected: "Molimo popunite formu pažljivo"

# Test 3: Suspicious email
- Pokušaj sa test@mailinator.com
- Expected: "Email adresa izgleda sumnjivo"

# Test 4: Weak password
- Pokušaj sa "password123"
- Expected: "Lozinka nije dovoljno jaka"

# Test 5: Rate limiting
- 6 pokušaja za 60 sekundi
- Expected: "Previše pokušaja"

# Test 6: Valid registration
- Email: test@gmail.com
- Password: TestPass123!
- reCAPTCHA: checked
- Expected: "Registracija uspješna! Provjerite email"
```

### 8. Supabase Edge Functions Deploy

```bash
# Ako koristite Edge Functions, deploy-ujte ih:
supabase functions deploy function-name
```

### 7. Database Cleanup Cron Jobs

U Supabase Dashboard > Database > Cron Jobs, kreirajte:

```sql
-- Čisti stare audit logove (svakog dana u 2AM)
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 2 * * *',
  'SELECT cleanup_old_audit_logs()'
);

-- Čisti password reset attempts (svakih 6 sati)
SELECT cron.schedule(
  'cleanup-password-resets',
  '0 */6 * * *',
  'SELECT cleanup_password_reset_attempts()'
);
```

### 8. Monitoring Setup

#### A. Supabase Dashboard Alerts
```
1. Database > Settings > Alerts
2. Omogući:
   - High CPU usage (80%)
   - High Memory usage (80%)
   - Connection pool usage (80%)
   - Storage usage (80%)
```

#### B. Audit Log Monitoring
```sql
-- Query za dnevni pregled sumnjive aktivnosti
SELECT
  action,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM security_audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY action
ORDER BY count DESC;
```

### 9. Backup Strategy

```
1. Supabase automatski radi daily backups
2. Enable Point-in-Time Recovery (PITR) za critical apps
3. Test restore procedure mjesečno
```

### 10. Security Scanning

```bash
# Scaniraj dependencies za vulnerabilities
npm audit

# Fix automatski
npm audit fix

# Ako ima critical vulnerabilities:
npm audit fix --force
```

### 11. Testing Pre-Deploy

```bash
# 1. Run security tests
npm run build

# 2. Test locally sa production varijablama
npm run preview

# 3. Testiraj:
- ✅ Login/Register radi
- ✅ RLS sprječava pristup tuđim podacima
- ✅ File upload ima validaciju
- ✅ Rate limiting radi
- ✅ XSS protection radi
```

### 12. Post-Deploy Verifikacija

```bash
# 1. Provjerite Security Headers
curl -I https://vašadomena.com

# Trebalo bi vidjeti:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block

# 2. Testiraj RLS
# Pokušaj pristupiti tuđim podacima - trebalo bi vratiti error

# 3. Provjerite Audit Logs
# U Supabase dashboardu, provjerite da li se loguju eventi
```

---

## Production Checklist

Prije nego što označite deployment kao complete:

### Security Basics
- [ ] .env fajl nije u git repository
- [ ] Sve environment varijable postavljene
- [ ] RLS omogućen na svim tabelama
- [ ] HTTPS forced i radi
- [ ] CSP headers postavljeni
- [ ] Storage policies postavljene
- [ ] Admin pristup zaštićen

### Anti-Spam & Bot Protection
- [ ] ✅ Email verification omogućena u Supabase
- [ ] ✅ Email delivery testiran (Gmail, Yahoo, Outlook)
- [ ] ✅ reCAPTCHA v2 konfigurisano (Site Key u .env)
- [ ] ✅ reCAPTCHA testiran (checkbox radi)
- [ ] ✅ Honeypot fields testirani
- [ ] ✅ Timing detection testiran (<3s blokira)
- [ ] ✅ Suspicious email detection testiran
- [ ] ✅ Password strength validation testirana
- [ ] ✅ Rate limiting testiran (5 pokušaja/min)
- [ ] ✅ spam_detection_log tabela kreirana

### Infrastructure
- [ ] Edge Functions deployed (ako postoje)
- [ ] Cron jobs postavljeni
- [ ] Monitoring i alerting omogućen
- [ ] Backups omogućeni
- [ ] Security scan prošao
- [ ] Manual security testing prošao
- [ ] Security headers validovani
- [ ] Rate limiting testiran

---

## Emergency Contact

Ako pronađete security issue u produkciji:

1. **ODMAH** kontaktirajte tim
2. Dokumentujte issue u `security_audit_log`
3. Prijavite putem email: security@zamijeniauto.ba
4. Ne objavljujte javno dok nije fixed

---

## Security Monitoring (Post-Deploy)

### Daily
```sql
-- Check za sumnjive login pokušaje
SELECT user_id, COUNT(*) as failed_attempts
FROM security_audit_log
WHERE action = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 5;
```

### Weekly
```bash
# Run dependency audit
npm audit

# Check Supabase logs za errors
# Dashboard > Logs > Error logs
```

### Monthly
```bash
# Full security review
# Test all security features
# Review i update politike
```

---

## Production URLs

Za finalni deployment, ažurirajte:

1. **Supabase Dashboard**
   - Site URL: `https://zamijeniauto.ba`
   - Redirect URLs: `https://zamijeniauto.ba/**`

2. **Google reCAPTCHA**
   - Domains: `zamijeniauto.ba`

3. **CORS Settings** (ako koristite custom domain)
   - Allowed Origins: `https://zamijeniauto.ba`

---

**VAŽNO:** Sačuvajte ovu listu i pregledajte je prije svakog major deployments!
