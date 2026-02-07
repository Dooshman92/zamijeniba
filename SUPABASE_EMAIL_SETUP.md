# Supabase Email Verification Setup

## KRITIČNO: Mora se uraditi prije produkcije!

Ova aplikacija zahtijeva **obaveznu email verifikaciju** za sve nove korisnike. Bez ovoga, anti-spam sistem NEĆE raditi pravilno.

---

## Step 1: Otvori Supabase Dashboard

1. Idi na https://supabase.com
2. Otvori svoj projekat
3. Klikni na **Authentication** u lijevom meniju
4. Klikni na **Settings** tab

---

## Step 2: Enable Email Confirmations

U **Auth Settings** sekciji:

### Email Confirmations
```
✅ Enable Email Confirmations: ON

⚠️ IMPORTANT: Bez ovog settinga, korisnici mogu se prijaviti
odmah nakon registracije BEZ potvrde emaila!
```

### Site URL
```
Development: http://localhost:5173
Production:  https://vašadomena.com

Ovo je URL gdje će korisnici biti redirectovani nakon potvrde.
```

### Redirect URLs
Dodaj ove URLs (jedan po liniji):
```
http://localhost:5173/**
https://vašadomena.com/**
https://vašadomena.com/auth/confirm
```

---

## Step 3: Customize Email Template

### Confirmation Email Template

1. Idi na **Email Templates** tab
2. Selektuj **Confirm signup** template
3. Customize:

```html
<h2>Dobrodošli na zamijeniauto.ba!</h2>
<p>Hvala što ste se registrovali. Molimo potvrdite vašu email adresu klikom na dugme ispod:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Potvrdi Email</a></p>
<p>Ili kopirajte i zalijepite ovaj link u browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Link važi 24 sata.</p>
<p>Ako niste vi kreirali ovaj nalog, ignorišite ovaj email.</p>
<p>Srdačan pozdrav,<br>zamijeniauto.ba tim</p>
```

### Email Subject
```
Potvrdite vaš nalog na zamijeniauto.ba
```

---

## Step 4: SMTP Settings (Preporuka)

Za **bolji email deliverability** (manje spam flagova), konfiguriši custom SMTP:

### Opcija 1: Supabase Default SMTP
- Besplatno
- 200 emailova/sat limit
- Može završiti u spam folderu

### Opcija 2: Custom SMTP (PREPORUČENO za produkciju)

Koristi neki od ovih servisa:
- **SendGrid** (100 emails/dan FREE)
- **Mailgun** (5000 emails/mjesečno FREE)
- **AWS SES** (62,000 emails/mjesečno FREE)
- **Postmark** (100 emails/mjesečno FREE)

#### Setup Custom SMTP u Supabase:

1. Idi na **Settings** > **Project Settings** > **SMTP**
2. Enable Custom SMTP
3. Popuni podatke:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: SG.xxxxxxxxxxxxxxxxxxxxxxxxx
Sender Email: noreply@zamijeniauto.ba
Sender Name: zamijeniauto.ba
```

---

## Step 5: DNS Records (Samo za Custom Domain Email)

Ako koristite custom email domain (npr. noreply@zamijeniauto.ba):

### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all
TTL: 3600
```

### DKIM Record
```
Type: TXT
Name: s1._domainkey
Value: (dobićeš od SMTP providera)
TTL: 3600
```

### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@zamijeniauto.ba
TTL: 3600
```

**Ovi recordi DRASTIČNO poboljšavaju email deliverability!**

---

## Step 6: Testing

### Test 1: Development
```bash
1. Registruj se sa test email (npr. vas@gmail.com)
2. Otvori Supabase Dashboard > Authentication > Users
3. Provjeri da korisnik ima "Email Confirmed: false"
4. Otvori inbox (ili Supabase logs za email URL)
5. Klikni verification link
6. Provjeri da je status promijenjen na "Email Confirmed: true"
```

### Test 2: Production
```bash
1. Testuj sa različitim email providerima:
   - Gmail
   - Yahoo Mail
   - Outlook
   - ProtonMail
2. Provjeri inbox I spam folder
3. Measure deliverability rate (trebalo bi >95%)
```

### Test 3: User Flow
```bash
1. Registruj se
2. Pokušaj prijaviti se BEZ potvrde emaila
   Expected: "Email adresa nije potvrđena"
3. Potvrdi email
4. Prijavi se
   Expected: Uspješna prijava
```

---

## Step 7: Monitoring

### Check Email Delivery Rate

U Supabase Dashboard:
```
Authentication > Logs > Filter by "email"

Success rate should be >95%
If lower, check:
- SMTP settings
- DNS records
- Spam filters
```

### Common Issues

#### Issue: Email ne stiže
```
Solution:
1. Check spam folder
2. Check SMTP credentials
3. Check DNS records (SPF, DKIM)
4. Check email provider blocklist
```

#### Issue: Email stiže u spam
```
Solution:
1. Setup custom SMTP (SendGrid/Mailgun)
2. Add SPF, DKIM, DMARC records
3. Warm up email domain (slati postepeno)
4. Improve email content (manje linkova, više teksta)
```

#### Issue: Verification link expired
```
Default expiry: 24h

Korisnik može zatražiti novi link:
1. Idi na login
2. Klikni "Niste primili email?"
3. Re-send verification email
```

---

## Step 8: User Experience Improvements

### Custom Confirmation Page

Kreiraj `/auth/confirm` stranicu:

```typescript
// src/pages/AuthConfirm.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthConfirm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: window.location.hash,
          type: 'email'
        });

        if (error) {
          setStatus('error');
        } else {
          setStatus('success');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        setStatus('error');
      }
    };

    confirmEmail();
  }, [navigate]);

  if (status === 'loading') {
    return <div>Potvrđujemo vaš email...</div>;
  }

  if (status === 'success') {
    return (
      <div>
        <h1>✅ Email uspješno potvrđen!</h1>
        <p>Sada se možete prijaviti.</p>
        <p>Preusmjeravanje za 3 sekunde...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>❌ Greška pri potvrdi emaila</h1>
      <p>Link je možda istekao ili je neispravan.</p>
      <button onClick={() => navigate('/register')}>
        Zatražite novi link
      </button>
    </div>
  );
}
```

---

## Checklist

Prije nego označiš kao completed:

- [ ] ✅ Email confirmations enabled u Supabase
- [ ] ✅ Site URL postavljeni (dev + prod)
- [ ] ✅ Redirect URLs dodani
- [ ] ✅ Email template customizovan (branding, copy)
- [ ] ✅ Custom SMTP setup (optional ali preporučeno)
- [ ] ✅ DNS records dodani (ako custom domain)
- [ ] ✅ Testiran email delivery (Gmail, Yahoo, Outlook)
- [ ] ✅ Testiran user flow (register -> verify -> login)
- [ ] ✅ Provjeren spam folder delivery
- [ ] ✅ Monitoring postavljen

---

## FAQ

### Q: Da li moram koristiti custom SMTP?
**A:** Ne, ali JAKO preporučeno za produkciju. Supabase default SMTP ima:
- Lower deliverability rate (~80%)
- Rate limits (200/sat)
- Više šanse za spam folder

### Q: Koliko košta custom SMTP?
**A:** Većina ima besplatne tier-ove:
- SendGrid: 100/dan FREE
- Mailgun: 5000/mjesec FREE
- AWS SES: 62,000/mjesec FREE

### Q: Mogu li disable-ovati email verification u developmentu?
**A:** DA, ali **OBAVEZNO** enabled u produkciji! U developmentu, Supabase automatski potvrđuje emailove.

### Q: Šta ako korisnik ne primi email?
**A:** Dodaj "Resend verification email" funkcionalnost:
```typescript
const resendVerificationEmail = async (email: string) => {
  await supabase.auth.resend({
    type: 'signup',
    email: email
  });
};
```

### Q: Koliko dugo verification link važi?
**A:** 24 sata (default). Može se konfigurirati u Supabase dashboard.

---

**Important:** Email verification je **PRVA LINIJA ODBRANE** protiv spam-a i botova. Bez nje, sve ostale anti-spam mjere su manje efikasne!

---

**Verzija**: 1.0
**Datum**: 2026-02-07
