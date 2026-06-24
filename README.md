# Spiewnik Gitarowy

Nowoczesny spiewnik gitarowy jako PWA (Progressive Web App) — React + TypeScript + Vite + Supabase + Tailwind CSS.

Wdrozony na: **Vercel** (auto-deploy z brancha `main`)
Baza danych: **Supabase** (publiczny SELECT, auth-gated INSERT/UPDATE/DELETE)
Repozytorium: https://github.com/MariuszOnik/spiewnik-gitarowy

---

## Wymagania

- **Node.js** 20+ (sprawdz: `node -v`)
- **npm** 10+ (sprawdz: `npm -v`)
- Plik `.env` z kluczami Supabase (skopiuj z `.env.example`)

---

## Pierwsze uruchomienie (jednorazowo)

```bash
npm install
```

Skopiuj plik srodowiskowy i uzupelnij klucze Supabase:

```bash
copy .env.example .env
# otworz .env i wklej prawdziwy URL i anon key z dashboardu Supabase
```

---

## Skrypty npm

| Komenda | Co robi |
|---|---|
| `npm run dev` | Uruchamia serwer deweloperski na `localhost:5173` (dostepny tez z telefonu w tej samej sieci przez IP komputera) |
| `npm run build` | Sprawdza TypeScript i buduje wersje produkcyjna do folderu `dist/` |
| `npm run preview` | Serwuje lokalnie juz zbudowany `dist/` — symulacja produkcji |
| `npm run lint` | Uruchamia linter (oxlint) |
| `npm test` | Uruchamia testy jednostkowe jednorazowo |
| `npm run test:watch` | Testy w trybie watch — przeladowuja sie przy kazdej zmianie |

> **Wazne:** `npm run build` = TypeScript + Vite bundle. Jesli `tsc` zglosi blad, build sie nie powiedzie.
> Zawsze sprawdzaj po zmianach — Vercel tez robi build i odrzuci commit jesli sie nie kompiluje.

---

## Typowy cykl pracy (zmiana kodu -> GitHub -> produkcja)

### 1. Uruchom serwer deweloperski

```bash
npm run dev
```

Otworz `http://localhost:5173` w przegladarce. Zmiany w plikach odswieza sie natychmiastowo (Hot Module Replacement).

### 2. Wprowadz zmiany w plikach `src/`

Patrz sekcja **Struktura projektu** ponizej.

### 3. Sprawdz build przed commitem

```bash
npm run build
```

Jesli pojawia sie bledy TypeScript — napraw je przed commitem.

### 4. Zrob commit i wypchnij na GitHub

```bash
git add src/NazwaZmienionegoPlik.tsx
git commit -m "krotki opis co zmieniles"
git push
```

Vercel automatycznie wykryje push na `main` i zadepluje nowa wersje w ciagu ~1-2 minut.

> **Nie rob `git add .`** — mozesz przypadkowo dodac pliki konfiguracyjne, cache lub `.env`.

---

## Struktura projektu

```
src/
|-- pages/                    # Widoki (strony aplikacji)
|   |-- SongListPage          # Lista piosenek (strona glowna /)
|   |-- SongViewPage          # Widok piosenki + toolbar z transpozycja
|   |-- SongEditPage          # Edytor piosenki
|   |-- StagePage             # Tryb sceniczny (duze litery, ciemne tlo)
|   |-- HelpPage              # Strona pomocy / manual
|   |-- SetlistsPage          # Lista setlist
|   |-- SetlistDetailPage     # Szczegoly setlisty
|   |-- AuthPage              # Logowanie / rejestracja
|   `-- ProfilePage           # Profil uzytkownika
|
|-- components/
|   |-- SongRenderer          # Renderuje akordy + tekst (ch-unit positioning)
|   |-- SongCard              # Karta piosenki na liscie
|   |-- SongSettingsModal     # Modal ustawien koloru/czcionki
|   `-- SearchBar             # Pole wyszukiwania z filtrami
|
|-- store/                    # Zustand — globalny stan aplikacji
|   |-- songsStore            # Piosenki: CRUD, transpozycja, capo, sync Supabase
|   |-- settingsStore         # Ustawienia UI: motyw, notacja, kolory, czcionka
|   |-- authStore             # Auth: login, logout, rejestracja
|   `-- setlistStore          # Setlisty: CRUD
|
|-- utils/
|   |-- chords.ts             # Parser akordow, transpozycja, notacja europejska/angielska
|   `-- songKey.ts            # Klucz grupowania wersji piosenki
|
|-- hooks/
|   |-- useInitDb.ts          # Laduje piosenki z Supabase/IndexedDB przy starcie
|   `-- useAutoScroll.ts      # Hook auto-scrollu
|
|-- db/                       # Dexie (IndexedDB) — lokalna baza danych
|-- lib/supabase.ts           # Klient Supabase
|-- types/index.ts            # Typy TypeScript (Song, Setlist, UserSettings itp.)
|-- App.tsx                   # Router + inicjalizacja DB (useInitDb tu!)
`-- main.tsx                  # Punkt wejscia
```

---

## Jak dziala synchronizacja danych

- **Supabase** jest glowna baza — piosenki sa publiczne (kazdy moze czytac bez logowania)
- **IndexedDB** (przez Dexie) to lokalna kopia — dziala offline, przyspiesza ladowanie
- Przy starcie aplikacji `useInitDb` (w `App.tsx`) ciagnie dane z Supabase => zapisuje do IndexedDB => ustawia w Zustand store
- Przy edycji: najpierw zapis do IndexedDB, potem Supabase (jesli zalogowany)
- Wersje piosenek: kilku uzytkownikow moze miec swoje wersje tej samej piosenki; grupowane sa po `songKey = "title::artist"`

---

## Srodowisko produkcyjne

- **Hosting:** Vercel — kazdy push na `main` = automatyczny deploy
- **Zmienne srodowiskowe na Vercel:** ustaw `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` w panelu projektu (Settings > Environment Variables)
- **PWA:** aplikacja instaluje sie jako ikona na telefonie (manifest + Service Worker przez `vite-plugin-pwa`)

---

## Najczestsze problemy

**Build nie przechodzi (blad TypeScript)**
Uruchom `npm run build` lokalnie, przeczytaj blad, napraw przed pushem.

**Zmiany nie pojawiaja sie na produkcji**
Sprawdz w panelu Vercel czy deploy zakoczyl sie sukcesem. Jesli "Build Failed" — sa bledy TS.

**Piosenki nie laduja sie po odswiezeniu strony**
`useInitDb` musi byc w `App.tsx` — tam jest, nie przenosic do konkretnych podstron.

---

## Nota dla Claude (AI assistant)

> Ta sekcja jest dla asystenta AI wspolpracujacego przy tym projekcie.

**Co robimy:**
Budujemy gitarowy spiewnik PWA dla Mariusza. Aplikacja pozwala dodawac piosenki z akordami, transponowac, grac z auto-scrollem, tworzyc setlisty, wspoldzielic z innymi uzytkownikami.

**Stack i kluczowe decyzje:**
- React 19 + TypeScript strict, Vite 8, Tailwind CSS 3, Zustand, Dexie, Supabase
- Akordy sa renderowane inline z `ch`-unit absolute positioning (SongRenderer.tsx) — chords follow wrapped text
- Dane trzymamy w Supabase (kolumna `data` typu JSONB przechowuje caly obiekt Song)
- IndexedDB (Dexie) jako lokalna kopia/cache, sync przy starcie przez `useInitDb` w `App.tsx`
- `songKey = "title::artist"` grupuje wersje tej samej piosenki od roznych uzytkownikow
- Akordy przechowywane w notacji angielskiej (C#, A#, B), wyswietlane opcjonalnie w europejskiej (Cis, B, H) przez `contentToEuropean()`
- `transposeOffset` na obiekcie Song sluzy do wyswietlania ile poltonow przesuniety aktualne uklad (dla piosenek bez `originalKey`)

**Kluczowe pliki do edycji:**
- `src/components/SongRenderer.tsx` — rendering akordow nad tekstem, absolutne pozycjonowanie ch-unit
- `src/utils/chords.ts` — cala logika akordow: parser, transpozycja, notacja (uwaga: modulo dla ujemnych! `((x%12)+12)%12`)
- `src/pages/SongViewPage.tsx` — glowny widok piosenki z toolbar: transpozycja, capo, czcionka, auto-scroll
- `src/store/songsStore.ts` — CRUD piosenek, sync Supabase/IndexedDB
- `src/types/index.ts` — typy (Song, Setlist itp.)

**Uwagi praktyczne:**
- Przed commitem zawsze `npm run build` — TypeScript strict odrzuca nieuzywane zmienne (TS6133)
- Edit tool moze miec problem z polskimi literami w old_string — wtedy uzyj Write (caly plik) lub PowerShell Replace()
- Nie robic `git add .` — tylko konkretne pliki src/
- Push na main = automatyczny deploy na Vercel
