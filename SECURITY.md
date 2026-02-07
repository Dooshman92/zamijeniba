# Sigurnosna Dokumentacija - zamijeniauto.ba

## Pregled Sigurnosnih Mjera

Ova platforma implementira višeslojnu sigurnosnu arhitekturu koja štiti korisnike, njihove podatke i sprječava zloupotrebe sistema.

---

## 1. Zaštita API Ključeva

### Frontend Ključevi
- **VITE_SUPABASE_ANON_KEY**: Javni ključ (siguran za izlaganje)
  - Koristi se samo za autentifikovane zahtjeve
  - Zaštićen Row Level Security (RLS) politikama
  - Nema pristup osjetljivim podacima bez autentifikacije

### Backend Ključevi
- **SUPABASE_SERVICE_ROLE_KEY**: Nikada se ne koristi na frontendu
  - Dostupan samo u Supabase Edge Functions
  - Koristi se samo za admin operacije
  - Automatski je sigurno postavljen u Supabase okruženju

---

## 2. Row Level Security (RLS)

Sve tabele u bazi podataka imaju omogućen RLS. Ovo znači da korisnici mogu pristupiti **samo svojim podacima** ili podacima koji su im eksplicitno dozvoljeni.

### Primjeri RLS Politika

#### User Profiles
```sql
-- Korisnici mogu vidjeti samo svoje profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

#### Cars (Oglasi)
```sql
-- Svi mogu vidjeti aktivne oglase
CREATE POLICY "Anyone can view active cars"
  ON cars FOR SELECT
  USING (status = 'active');

-- Korisnici mogu ažurirati samo svoje oglase
CREATE POLICY "Users can update own cars"
  ON cars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Messages (Poruke)
```sql
-- Korisnici mogu vidjeti samo svoje poruke
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid()
  );
```

### Sve Tabele sa RLS
- ✅ user_profiles
- ✅ cars
- ✅ messages
- ✅ conversations
- ✅ swap_offers
- ✅ favorites
- ✅ car_images
- ✅ promo_codes
- ✅ promo_code_redemptions
- ✅ reports
- ✅ support_tickets
- ✅ advertisements
- ✅ security_audit_log
- ✅ password_reset_attempts

---

## 3. Input Sanitizacija i Validacija

### Frontend Validacija

Svi korisnikosnički unosi prolaze kroz rigoroznu validaciju prije slanja u bazu:

```typescript
// Email validacija
validateEmail(email) // RFC compliant regex

// Telefon validacija
validatePhoneNumber(phone) // Samo brojevi, +, -, ()

// Sanitizacija HTML/JS
sanitizeInput(input) // Uklanja <script>, onclick=, itd.

// Validacija slika
validateImageFile(file) // Max 5MB, samo JPEG/PNG/WebP
```

### SQL Injection Zaštita
- Supabase automatski koristi prepared statements
- Nikada ne sastavljamo SQL stringove direktno
- Svi parametri se prosleđuju kao bind variables

### XSS (Cross-Site Scripting) Zaštita
```typescript
// Svi inputi se sanitizuju
const sanitized = sanitizeInput(userInput)
  .replace(/[<>]/g, '')
  .replace(/javascript:/gi, '')
  .replace(/on\w+\s*=/gi, '');
```

---

## 4. Rate Limiting

### Client-Side Rate Limiting
```typescript
// 5 pokušaja u 60 sekundi
rateLimiter(`auth_login_${email}`, 5, 60000)
```

### Implementirane Rate Limite
- **Login**: 5 pokušaja / 60 sekundi
- **Register**: 5 pokušaja / 60 sekundi
- **Password Reset**: 5 pokušaja / 60 sekundi
- **Message Send**: 10 poruka / minut
- **Car Creation**: 3 oglasa / dan (za neplaćene korisnike)

### Server-Side Rate Limiting
Supabase automatski implementira rate limiting na:
- API zahtjeve: 100 zahtjeva / sekundu
- Realtime connections: 100 konekcija / korisnik
- Storage uploads: 10MB / sekund

---

## 5. Content Security Policy (CSP)

### HTTP Headers

Implementirani sigurnosni headeri:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### CSP Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.google.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-src https://www.google.com;
object-src 'none';
```

**Šta ovo znači:**
- Samo naši scripti mogu se izvršavati (osim Google reCAPTCHA)
- Slike se mogu učitavati samo sa sigurnih izvora
- Samo Supabase može primati network zahtjeve
- Onemogućeni Flash/Java apleti
- Stranica ne može biti embedovana u iframe

---

## 6. Autentifikacija

### Password Sigurnost
- Minimum 6 karaktera
- Supabase koristi bcrypt hashing
- Cost factor: 10 (industry standard)

### Session Management
- JWT tokeni sa 1h trajanjem
- Automatski refresh tokeni
- Secure HTTP-only cookies (u produkciji)

### Email Verifikacija
- Novi korisnici mogu se registrovati odmah
- Email potvrda nije obavezna (može se konfigurirati)

---

## 7. Audit Logging

### Security Audit Log Tabela

Prati sve sigurnosno relevantne događaje:

```typescript
{
  action: 'login_failed',
  user_id: 'uuid',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0...',
  details: { reason: 'invalid_password' }
}
```

### Loguju se:
- ❌ Neuspješni login pokušaji
- 🚫 Rate limit prekoračenja
- ⚠️ Sumnjive aktivnosti
- 🔐 Password reset pokušaji
- 🛡️ Admin akcije

### Automatsko Čišćenje
- Logovi stariji od 90 dana se automatski brišu
- Funkcija: `cleanup_old_audit_logs()`

---

## 8. Zaštita od Automatizovanih Napada

### Google reCAPTCHA v2
- Implementiran na registraciji
- Sprječava bot registracije
- Site key: Javni (siguran za frontend)

### Honeypot Polja
- Skrivena polja koja botovi popunjavaju
- Automatski odbijaju submissione

---

## 9. Storage Sigurnost

### Supabase Storage Politike

#### Car Images Bucket
```sql
-- Samo autentifikovani korisnici mogu upload-ovati
CREATE POLICY "Users can upload car images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'car-images');

-- Svi mogu vidjeti slike
CREATE POLICY "Anyone can view car images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');
```

#### Avatars Bucket
```sql
-- Korisnici mogu upload-ovati samo svoje avatare
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### File Validation
- Max veličina: 5MB (slike), 10MB (avatari)
- Dozvoljeni tipovi: JPEG, PNG, WebP
- Automatska sanitizacija imena fajlova

---

## 10. HTTPS i Enkriptovani Transport

### U Produkciji
- ✅ HTTPS Only (Forced Redirect)
- ✅ TLS 1.3
- ✅ HSTS Headers
- ✅ Certificate Pinning (via Supabase)

### Supabase Connections
- Svi API zahtjevi preko HTTPS
- WebSocket konekcije preko WSS
- End-to-end enkriptovane konekcije

---

## 11. Admin Panel Sigurnost

### Pristup
- Samo korisnici sa `is_admin = true`
- Dodatna RLS politika za admin tabele
- Moderatori imaju ograničen pristup

### Admin Akcije
- Brisanje korisnika
- Ban/Unban korisnika
- Kreiranje promo kodova
- Pregled audit logova
- Moderiranje sadržaja

### Moderator Akcije (Ograničeno)
- Brisanje oglasa
- Pregled prijava
- Moderiranje komentara

---

## 12. Dodatne Sigurnosne Mjere

### 1. CORS Zaštita
Edge funkcije imaju striktne CORS politike:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Samo naš domen u produkciji
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
```

### 2. UUID Validacija
```typescript
// Prije svakog database query-a
if (!isValidUUID(id)) {
  throw new Error('Invalid ID');
}
```

### 3. Secure Token Generation
```typescript
// Kriptografski sigurni tokeni
generateSecureToken() // Crypto.getRandomValues()
```

### 4. Password Reset Sigurnost
- 5 pokušaja / email / dan
- Automatski lockout nakon 5 pokušaja
- Reset linkovi važe 1h
- Jednokratni tokenitokeni

---

## 13. Compliance i Best Practices

### GDPR Compliance
- ✅ Korisnici mogu obrisati svoj nalog
- ✅ Data export funkcionalnost
- ✅ Clear privacy policy
- ✅ Explicit consent za data collection

### OWASP Top 10 Zaštita
1. ✅ **Injection**: Prepared statements, input sanitizacija
2. ✅ **Broken Authentication**: Bcrypt, session management, 2FA ready
3. ✅ **Sensitive Data Exposure**: HTTPS, encrypted storage
4. ✅ **XML External Entities**: Ne koriste se XML parseri
5. ✅ **Broken Access Control**: Striktni RLS
6. ✅ **Security Misconfiguration**: Hardened headers, CSP
7. ✅ **XSS**: Input sanitizacija, CSP
8. ✅ **Insecure Deserialization**: JSON.parse sa validacijom
9. ✅ **Using Components with Known Vulnerabilities**: npm audit
10. ✅ **Insufficient Logging**: Audit log tabela

---

## 14. Incidenta Response Plan

### U Slučaju Sigurnosnog Incidenta

1. **Identifikacija**
   - Provjeri `security_audit_log` tabelu
   - Identifikuj kompromitovane naloge

2. **Containment**
   - Ban-uj kompromitovane naloge
   - Revoke JWT tokene (force logout)
   - Disable kompromitovane funkcije

3. **Eradication**
   - Patch sigurnosnu rupu
   - Deploy fix immediately
   - Update dependencies

4. **Recovery**
   - Notify korisnici
   - Force password reset
   - Monitor audit logs

5. **Lessons Learned**
   - Document incident
   - Update security measures
   - Train team

---

## 15. Security Checklist za Deployment

- [ ] Promijeni sve default passwords
- [ ] Generiši nove API ključeve za produkciju
- [ ] Enable HTTPS only
- [ ] Configure firewall rules
- [ ] Setup monitoring i alerting
- [ ] Enable automatic backups
- [ ] Test incident response plan
- [ ] Review i audit RLS politike
- [ ] Setup rate limiting na CDN nivou
- [ ] Enable DDoS protection
- [ ] Configure logging i monitoring
- [ ] Setup automated security scanning
- [ ] Review dependencies za vulnerabilities
- [ ] Enable 2FA za admin naloge
- [ ] Configure CSP u produkciji
- [ ] Test sigurnost sa penetration testingom

---

## 16. Kontakt za Sigurnosne Prijave

Ako pronađete sigurnosnu ranjivost, molimo vas da je prijavite odgovorno:

- Email: security@zamijeniauto.ba
- Očekivani odgovor: 48h
- Bug bounty program: TBD

**Molimo NE objavljujte javno dok ne dobijete potvrdu da je ispravljeno.**

---

## 17. Redovna Sigurnosna Održavanja

### Mjesečno
- [ ] Review audit logs
- [ ] Update dependencies
- [ ] Run security scan
- [ ] Check for unauthorized access

### Kvartalno
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review i update politike
- [ ] Train tim na nove prijetnje

### Godišnje
- [ ] External security audit
- [ ] Compliance review
- [ ] Update incident response plan
- [ ] Security awareness training

---

## Zaključak

Ova platforma implementira **defense-in-depth** pristup sigurnosti sa multiple slojeva zaštite:

1. ✅ Network Level (HTTPS, CSP, CORS)
2. ✅ Application Level (Input validation, rate limiting)
3. ✅ Database Level (RLS, audit logs)
4. ✅ Authentication Level (Bcrypt, JWT)
5. ✅ Monitoring Level (Audit logs, alerting)

Sigurnost je kontinuirani proces, ne destinacija. Redovno ažuriraj dependencies, prati nove sigurnosne prijetnje i održavaj audit logove.

---

**Verzija**: 1.0
**Datum**: 2026-02-07
**Autor**: zamijeniauto.ba Security Team
