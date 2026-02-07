# Brza Sigurnosna Provjera

## 5-Minutna Sigurnosna Provjera

Koristite ovu listu da brzo provjerite da li je vaša aplikacija sigurna.

### 1. Environment Variables (30 sekundi)

```bash
# Provjerite da .env nije u git-u
git ls-files | grep .env

# Trebalo bi biti prazno! Ako vidi .env, ODMAH ga uklonite:
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### 2. Dependency Security (1 minut)

```bash
# Provjerite za poznate vulnerabilities
npm audit

# Trebalo bi biti 0 vulnerabilities
# Ako ima, pokrenite:
npm audit fix
```

### 3. RLS Check (1 minut)

Otvori Supabase Dashboard SQL Editor i pokreni:

```sql
-- Provjeri da SVE tabele imaju RLS
SELECT
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Sve tabele MORAJU imati RLS = Enabled!**

### 4. HTTPS Check (30 sekundi)

```bash
# Test production URL
curl -I https://vašadomena.com | grep -i "strict-transport-security"

# Trebalo bi vidjeti HSTS header
```

### 5. Security Headers Check (1 minut)

Otvori https://securityheaders.com i unesite vašu domenu.

**Minimalni zahtjevi:**
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Content-Security-Policy

Cilj: **Ocjena A ili B**

### 6. Storage Bucket Policies (1 minut)

U Supabase Dashboard > Storage:

```
car-images bucket:
- ✅ Max file size: 5MB
- ✅ Public access za READ
- ✅ Authenticated-only za WRITE

avatars bucket:
- ✅ Max file size: 10MB
- ✅ Public access za READ
- ✅ Authenticated-only za WRITE
```

---

## Kritični Sigurnosni Problemi

Ako bilo koji od ovih postoji, **ODMAH** riješite prije puštanja u produkciju:

### 🔴 CRITICAL
- [ ] `.env` fajl u git repository
- [ ] RLS nije omogućen na svim tabelama
- [ ] HTTPS nije forsiran
- [ ] Nema input validacije
- [ ] Supabase Service Role Key izložen na frontendu

### 🟠 HIGH
- [ ] Nema rate limitinga
- [ ] Nema security headers
- [ ] Vulnerabilities u dependencies
- [ ] Nema audit logginga
- [ ] Storage buckets javno writable

### 🟡 MEDIUM
- [ ] Nema CSP headera
- [ ] Weak password policy
- [ ] Nema email verifikacije
- [ ] Nema backup strategije
- [ ] Nema monitoring/alerting

---

## Quick Fix Commands

### Fix .env u git-u
```bash
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Remove .env and add to gitignore"
```

### Fix Dependencies
```bash
npm audit fix --force
npm install
git add package*.json
git commit -m "Fix security vulnerabilities"
```

### Enable RLS na svim tabelama
```sql
-- Za SVAKU tabelu:
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## Production Readiness Score

Odgovorite DA/NE:

1. [ ] Svi API ključevi su sigurni? (DA/NE)
2. [ ] RLS omogućen na svim tabelama? (DA/NE)
3. [ ] HTTPS forsiran? (DA/NE)
4. [ ] Security headers postavljeni? (DA/NE)
5. [ ] Input validacija implementirana? (DA/NE)
6. [ ] Rate limiting radi? (DA/NE)
7. [ ] File upload validacija postoji? (DA/NE)
8. [ ] Audit logging omogućen? (DA/NE)
9. [ ] npm audit bez vulnerabilities? (DA/NE)
10. [ ] Backup strategija postoji? (DA/NE)

**Scoring:**
- 10/10 DA: ✅ SPREMNO za produkciju
- 8-9/10 DA: ⚠️ SKORO spremno, riješite preostale
- 6-7/10 DA: 🟡 NIJE spremno, potreban dodatni rad
- <6/10 DA: 🔴 KRITIČNO, ne deployajte!

---

## Contact za Pomoć

Ako niste sigurni u bilo koju od ovih provjera:
- Pročitajte [SECURITY.md](./SECURITY.md)
- Pročitajte [DEPLOYMENT_SECURITY.md](./DEPLOYMENT_SECURITY.md)
- Kontaktirajte: security@zamijeniauto.ba

---

**Vrijeme čitanja: 5 minuta**
**Vrijeme implementacije svih fix-ova: 30-60 minuta**
