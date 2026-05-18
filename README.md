# stats.sportup.sk — IS Športu štatistiky

Interaktívny dashboard štatistík Informačného systému športu Slovenska (2021–2026) pre potreby Ministerstva školstva a športu SR.

**Live URL:** https://stats.sportup.sk  
**Vercel projekt:** stats-sportup-sk (tím ltksolutions)  
**GitHub repo:** https://github.com/ltksolutions/stats-sportup-sk  

---

## Tech stack

| Vrstva | Technológia |
|--------|------------|
| Frontend + SSR | Next.js 14 (Pages Router) |
| Databáza | MongoDB Atlas — cluster `is-sportu-history`, DB `is_sportu`, kolekcia `osoby` |
| Grafy | Chart.js 4.4.1 (CDN, žiadny npm balík) |
| Hosting | Vercel (tím ltksolutions) — auto-deploy pri push na `main` |
| DNS | `stats CNAME cname.vercel-dns.com` v správe domény sportup.sk |

---

## Lokálne spustenie

```bash
cd /Users/janletko/Documents/GitHub/stats-sportup-sk

# Inštalácia závislostí (stačí raz)
npm install

# Vytvor .env.local zo šablóny a doplň connection string
cp .env.example .env.local

# Spusti dev server
npm run dev
# → http://localhost:3000
```

> **.env.local** nie je v gite. Potrebuješ `MONGODB_URI` — connection string nájdeš v Vercel → Project → Settings → Environment Variables.

---

## Štruktúra projektu

```
stats-sportup-sk/
├── pages/
│   ├── index.js          ← hlavná stránka, všetky grafy + interaktivita
│   └── api/
│       ├── vek-sporty.js      ← vekový profil top 20 športov (athletes)
│       ├── vek-porovnanie.js  ← porovnanie 1–10 športov, athlete|expert
│       ├── zvazy.js           ← top 30 zväzov podľa počtu športovcov
│       ├── amater-profi.js    ← amatéri vs profesionáli, top 20 športov
│       ├── odbornici.js       ← športoví odborníci, top 25 kategórií
│       └── roky-sport.js      ← vývoj top 10 športov 2021–2026
├── lib/
│   └── mongodb.js        ← MongoDB connection pool (dev: global cache, prod: fresh)
├── styles/
│   └── globals.css       ← reset + základné štýly
├── .env.example          ← šablóna pre .env.local
├── vercel.json           ← {"framework":"nextjs"} — nutné pre správny Vercel build
└── package.json          ← next@14, react@18, mongodb@6
```

---

## API endpointy

Všetky endpointy prijímajú `?year=YYYY` (default: 2026), odpovede sú cachované 1 hodinu (`s-maxage=3600`).

| Endpoint | Parametre | Popis |
|----------|-----------|-------|
| `/api/vek-sporty` | `year` | Vekový profil top 20 športov (athletes), groupBy sport × VekovaSkupina |
| `/api/vek-porovnanie` | `year`, `activity=athlete\|expert` | Top 30 športov s vekovým rozložením pre porovnávací graf |
| `/api/zvazy` | `year` | Top 30 zväzov (Zvaz) podľa počtu atletov |
| `/api/amater-profi` | `year` | athlete_amateur vs athlete_professional, top 20 športov |
| `/api/odbornici` | `year` | Kategórie odborníkov × šport, top 25, ActivityID='expert' |
| `/api/roky-sport` | — | Vývoj top 10 športov (athletes + experts) za roky 2021–2026 |

### Dôležité: výkon MongoDB

Kolekcia `osoby` má státisíce záznamov. Každý API request **musí** filtrovať podľa `Year` (index!), inak query vyprší (timeout 25–29 s). Nikdy nerob aggregate bez `{ Year: parseInt(year) }` v `$match`.

---

## MongoDB — štruktúra kolekcie `osoby`

Kľúčové polia používané v dashboarde:

| Pole | Typ | Popis |
|------|-----|-------|
| `Year` | Number | Rok záznamu (2021–2026) — **indexované** |
| `ActivityID` | String | `"athlete"` alebo `"expert"` |
| `SubActivityID` | String | `"athlete_amateur"`, `"athlete_professional"`, kategória odborníka |
| `SubActivity` | String | Textový popis SubActivityID |
| `SportName` | String | Názov športu |
| `DisciplineName` | String | Odvetvie/disciplína |
| `Zvaz` | String | Názov zväzu |
| `VekovaSkupina` | String | Vekový bucket: `do 5`, `6-10`, `11-14`, `15-18`, `19-23`, `24-30`, `31-40`, `41-50`, `51-60`, `61+` |
| `DateOfBirth` | Date | Dátum narodenia |

---

## Funkcie dashboardu

### Globálny filter roku (header)

Tlačidlá rokov **2021–2026** v pravom hornom rohu — každá zmena roku obnoví všetky 4 hlavné grafy (vek, zväzy, amatér/profi, odborníci). Sekcia vývoja 2021–2026 je od filtra roku nezávislá (načíta sa raz).

---

### 1. Vekový profil top 20 športov

- **Čo zobrazuje:** počet **atletov** podľa vekových skupín pre top 20 športov vo vybranom roku
- **Typ grafu:** prepínač Čiary / Stĺpce (stacked)
- **Škála Y:** prepínač Lineárna / Log — log je užitočný, lebo futbal má ~200k a iné športy 5–40k
- **Filter vekových skupín:** preset tlačidlá Mládež (do 18) / Dospelí (19–40) / Seniori (41+) / Všetky + individuálny výber každej skupiny kliknutím
- **Skrytie línií:** kliknutím na šport v legende pod nadpisom skryješ/zobrazíš jeho líniu

---

### 2. Porovnanie športov podľa vekovej štruktúry *(nová sekcia)*

- **Čo zobrazuje:** vlastný výber športov, vzájomné porovnanie vekového profilu v čiarovom grafe
- **Kategória:** toggle **Športovci / Odborníci** — pri zmene sa načítajú nové dáta a automaticky sa vyberú top 5 športov
- **Výber športov:** farebné pill-tlačidlá pre top 30 športov, min. 1 max. 10 súčasne; každý šport má svoju farbu aj v grafe
- **Filter vekových skupín:** rovnaký mechanizmus ako v sekcii 1, nezávislý od neho
- **Škála:** vždy lineárna (skutočné počty), vždy čiarový graf

---

### 3. Top 30 zväzov

- Horizontálny bar chart, zoradený zostupne podľa počtu registrovaných atletov vo vybranom roku

---

### 4. Amatéri vs. profesionáli

- Stacked bar chart, top 20 športov, modrá = amatéri, oranžová = profesionáli

---

### 5. Športoví odborníci — top 25 kategórií

- Horizontálny bar chart, os Y = kombinácia kategória × šport (napr. "Tréner — Futbal")

---

### 6 & 7. Vývoj top 10 športov 2021–2026

- Dva grafy vedľa seba: Športovci | Odborníci
- Čiarový graf, os X = roky, každý šport jedna línia
- Načíta sa raz pri otvorení stránky, nezávislé od filtra roku

---

## Deployment

Každý `git push` na vetvu `main` → Vercel automaticky zbuilduje a zadeplojuje.

```bash
# V termináli (alebo cez GitHub Desktop):
git add -A
git commit -m "popis zmeny"
git push origin main
```

Vercel build log: https://vercel.com/ltksolutions/stats-sportup-sk

---

## Nastavenie Vercel (ak treba znova)

1. Vercel → New Project → Import `ltksolutions/stats-sportup-sk`
2. Framework: Next.js (automaticky deteguje cez `vercel.json`)
3. Environment Variables → pridaj `MONGODB_URI`
4. Domains → pridaj `stats.sportup.sk`
5. DNS: `stats CNAME cname.vercel-dns.com`

---

## Čo ešte chýba / možné rozšírenia

- [ ] Stránka pre konkrétny zväz (`/zvaz/[slug]`) — detail zväzu
- [ ] Stránka pre konkrétny šport (`/sport/[slug]`)
- [ ] Export dát do CSV/Excel
- [ ] Porovnanie rokov vedľa seba v jednom grafe
- [ ] Mobile-friendly layout (momentálne optimalizované pre desktop)
- [ ] Favicon / og:image pre zdieľanie
- [ ] Aktualizácia Next.js (14.2.3 má bezpečnostnú poznámku v Vercel build logu — nie je kritická pre interný nástroj)

---

## Kontakt / kontext

Projekt vznikol pre analýzu dát IS Športu 2021–2026 pre Ministerstvo školstva a športu SR.  
Autor: Jan Letko · jan.letko@futbalsfz.sk · SFZ Club Development
