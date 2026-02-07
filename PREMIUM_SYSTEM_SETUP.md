# Premium Sistem - Uputstvo za Aktivaciju

Aplikacija sada ima kontrolu nad premium sistemom. Po defaultu je **ISKLJUČEN** što znači da je aplikacija potpuno besplatna za sve korisnike.

## Kako aktivirati premium sistem

Da biste uključili premium sistem (krediti, promo kodovi, premium članstvo):

1. Otvorite fajl: `src/config/features.ts`

2. Promijenite `PREMIUM_ENABLED` sa `false` na `true`:

```typescript
export const FEATURES = {
  PREMIUM_ENABLED: true,  // promijeni na true da aktiviraš premium
} as const;
```

3. Sačuvaj fajl i projekat će automatski restart-ovati

## Šta se mijenja kada je premium sistem ISKLJUČEN (default)

Kada je `PREMIUM_ENABLED: false`:

✅ **Besplatne funkcionalnosti:**
- Dodavanje oglasa je besplatno (neograničeno)
- Slanje swap ponuda je besplatno (neograničeno)
- Boost oglasa je besplatan
- Do 15 slika po oglasu za sve korisnike
- Sve funkcionalnosti su dostupne svima

🚫 **Sakriveno:**
- Dugmad "Postani Premium", "Kupi Kredite", "Promo" u navigaciji
- Baneri na početnoj stranici za premium/kredite/promo kodove
- Prikaz kredita u profilu
- Premium badge

## Šta se mijenja kada je premium sistem UKLJUČEN

Kada je `PREMIUM_ENABLED: true`:

💳 **Potrebni krediti:**
- Dodavanje oglasa nakon prvog besplatnog
- Slanje swap ponuda nakon prve besplatne
- Boost oglasa
- Dodatne slike (preko 5)

⭐ **Premium funkcionalnosti:**
- Neograničeni oglasi
- Neograničene swap ponude
- Do 15 slika po oglasu
- Istaknuti oglasi (featured)
- Viši prioritet u prikazivanju

🎁 **Dodatne funkcionalnosti:**
- Promo kodovi za kredite
- Kupovina kredita
- Premium paketi

## Važne napomene

- Ova promjena **ne zahtijeva** izmjene u bazi podataka
- Sve mijenjate samo jedan fajl: `src/config/features.ts`
- Možete lako prebacivati između besplatnog i premium režima
- Kada je sistem isključen, svi postojeći premium korisnici i dalje imaju svoje podatke u bazi, ali sistem jednostavno ne provjerava te uslove
