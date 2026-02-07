# zamijeniauto.ba

Moderna platforma za zamjenu i prodaju automobila u Bosni i Hercegovini.

## Sigurnosne Karakteristike

Ova aplikacija implementira **enterprise-level** sigurnost sa multiple slojeva zaštite:

### Implementirane Sigurnosne Mjere

- **Row Level Security (RLS)**: Svi podaci su zaštićeni na database nivou
- **Input Sanitizacija**: Automatsko čišćenje svih korisničkih inputa
- **XSS Protection**: Content Security Policy i input validacija
- **Rate Limiting**: Zaštita od brute force napada
- **SQL Injection Protection**: Prepared statements i bind variables
- **HTTPS Only**: Forced enkriptovani transport
- **Secure Headers**: X-Frame-Options, CSP, HSTS
- **Audit Logging**: Sve sigurnosno relevantne akcije se loguju
- **Password Security**: Bcrypt hashing sa cost factor 10
- **File Upload Validation**: Striktna validacija tipova i veličina fajlova
- **Email Verification**: Obavezna potvrda emaila za sve nove korisnike
- **reCAPTCHA v2**: Anti-bot zaštita na registraciji
- **Honeypot Fields**: Skrivena polja za detekciju botova
- **Timing Detection**: Detekcija prebrze forme submission
- **Suspicious Email Detection**: Blokiranje temp mail servisa
- **Password Strength Validation**: Enforced jaka lozinka politika
- **Browser Fingerprinting**: Anti-account farming zaštita
- **Spam Detection Logging**: Kompletno praćenje spam pokušaja

Za detalje pogledajte:
- [SECURITY.md](./SECURITY.md) - Kompletna sigurnosna dokumentacija
- [ANTI_SPAM_PROTECTION.md](./ANTI_SPAM_PROTECTION.md) - Anti-spam i bot zaštita (10 layers)
- [SUPABASE_EMAIL_SETUP.md](./SUPABASE_EMAIL_SETUP.md) - Email verification setup guide
- [DEPLOYMENT_SECURITY.md](./DEPLOYMENT_SECURITY.md) - Production deployment checklist
- [SECURITY_QUICK_CHECK.md](./SECURITY_QUICK_CHECK.md) - 5-minutna brza provjera

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Icons**: Lucide React
- **Security**: Custom security layer + Supabase RLS

## Početak Rada

### Prerequisites

- Node.js 18+
- npm ili yarn
- Supabase account

### Instalacija

1. Clone repository
```bash
git clone https://github.com/your-username/zamijeniauto.ba.git
cd zamijeniauto.ba
```

2. Instaliraj dependencies
```bash
npm install
```

3. Kreiraj `.env` fajl (koristi `.env.example` kao template)
```bash
cp .env.example .env
```

4. Ažuriraj `.env` sa tvojim Supabase credentials
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. Pokreni development server
```bash
npm run dev
```

### Database Setup

Sve migracije su već kreirane. U Supabase dashboardu:

1. Idi na **SQL Editor**
2. Importuj sve migracije iz `supabase/migrations/` folder-a
3. Ili koristi Supabase CLI:
```bash
supabase db push
```

## Struktura Projekta

```
zamijeniauto.ba/
├── src/
│   ├── components/          # React komponente
│   ├── lib/                 # Utility funkcije i konfiguracija
│   │   ├── supabase.ts     # Supabase client
│   │   ├── auth.tsx        # Auth context
│   │   ├── security.ts     # Security helpers (NEW)
│   │   └── ...
│   ├── data/               # Statički podaci
│   └── config/             # App konfiguracija
├── supabase/
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge Functions
├── SECURITY.md             # Detaljna sigurnosna dokumentacija
├── DEPLOYMENT_SECURITY.md  # Production deployment checklist
└── .env.example            # Environment variables template
```

## Sigurnosne Funkcije

### Input Validacija

```typescript
import { sanitizeInput, validateEmail, validateImageFile } from './lib/security';

// Sanitizuj input prije slanja u bazu
const cleanInput = sanitizeInput(userInput);

// Validuj email
if (!validateEmail(email)) {
  throw new Error('Invalid email');
}

// Validuj image upload
const { valid, error } = validateImageFile(file);
```

### Rate Limiting

```typescript
import { rateLimiter } from './lib/security';

// 5 pokušaja u 60 sekundi
if (!rateLimiter('action_key', 5, 60000)) {
  throw new Error('Too many attempts');
}
```

## Features

- ✅ Registracija i autentifikacija korisnika
- ✅ Kreiranje i pretraga oglasa
- ✅ Napredni filteri za pretragu
- ✅ Real-time messaging sistem
- ✅ Swap offers (ponude za zamjenu)
- ✅ Premium membership sistem
- ✅ Admin panel za upravljanje platformom
- ✅ Promo kodovi i krediti sistem
- ✅ Support ticket sistem
- ✅ User reviews i ratings
- ✅ Advertisement management
- ✅ Security audit logging

## Deployment

Za deployment u produkciju, pročitajte [DEPLOYMENT_SECURITY.md](./DEPLOYMENT_SECURITY.md)

### Quick Deploy

**Netlify:**
```bash
npm run build
netlify deploy --prod
```

**Vercel:**
```bash
npm run build
vercel --prod
```

Prije deploya, provjerite da su sve sigurnosne mjere konfigurisane!

## Environment Variables

Potrebne environment varijable:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key (siguran za frontend)
- `VITE_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key (optional)

**VAŽNO:** Nikada ne commit-ujte `.env` fajlove u git!

## Security Reporting

Ako pronađete sigurnosnu ranjivost, molimo prijavite odgovorno:

- Email: security@zamijeniauto.ba
- **NE** objavljujte javno dok nije ispravljeno

## Contributing

1. Fork repository
2. Kreiraj feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Security Pull Requests**: Ako vaš PR uključuje sigurnosne promjene, označite ga sa `[SECURITY]` tagom.

## Testing

```bash
# Run type checking
npm run typecheck

# Run build
npm run build

# Security audit
npm audit
```

## License

[MIT License](LICENSE)

## Support

Za pitanja i podršku:
- Email: support@zamijeniauto.ba
- Support ticket sistem (u aplikaciji)

## Changelog

### v1.0.0 (2026-02-07)
- ✅ Initial release
- ✅ Complete security implementation
- ✅ Multi-layer protection
- ✅ Comprehensive documentation

---

**Napravljeno sa ❤️ u Bosni i Hercegovini**
