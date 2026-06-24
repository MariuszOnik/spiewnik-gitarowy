import type { Song } from '@/types'

export const SEED_SONGS: Song[] = [
  {
    id: 'seed-001',
    title: 'Droga przez las',
    artist: 'Jan Kowalski',
    author: 'Jan Kowalski',
    genre: 'folk',
    language: 'pl',
    originalKey: 'G',
    currentKey: 'G',
    capo: 0,
    bpm: 90,
    tags: ['folk', 'ballada', 'acoustic'],
    isFavorite: true,
    scrollSpeed: 50,
    fontSize: 18,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    content: `[Zwrotka 1]
G     Em    C       D
Szedłem przez las w porannej mgle
G        Em      C     D
Drzewa szumiały coś tylko dla mnie
C              G
I nie wiedziałem dokąd idę
C                 D
Ale szłem, bo trzeba iść

[Refren]
G          D
Droga przez las to nie jest zło
Em         C
Droga przez las to wolność
G          D
Idę przez las, bo tak chcę
C          D      G
I wracam gdy słońce wschodzi

[Zwrotka 2]
G     Em    C       D
Ptaki śpiewały mi o świcie
G        Em      C     D
Liście tańczyły w jesiennym rytmie
C              G
Znalazłem źródło przy polanie
C                 D
Napiłem się i ruszyłem dalej`,
  },
  {
    id: 'seed-002',
    title: 'Mała kawiarnia',
    artist: 'Trio Akustyczne',
    author: 'Anna Wiśniewska',
    genre: 'pop',
    language: 'pl',
    originalKey: 'C',
    currentKey: 'C',
    capo: 0,
    bpm: 110,
    tags: ['pop', 'kawiarnia', 'lato'],
    isFavorite: false,
    scrollSpeed: 45,
    fontSize: 18,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    content: `[Zwrotka 1]
C        Am      F        G
Siedzę przy oknie z kawą w dłoni
C           Am      F      G
Deszcz pada na szyby spokojnie
Am         F
Czytam książkę od rana
C              G
Nikt tu mnie nie pogania

[Refren]
F           G
Tu jest mój świat, mała kawiarnia
Am          C
Zapach kawy i muzyka
F           G
Czas się zatrzymał właśnie tu
Am          G       C
I nie chcę stąd odchodzić już

[Bridge]
Am    F     C    G
Może zostanę tu całe życie
Am    F     C    G
Może napiszę tu całą książkę`,
  },
  {
    id: 'seed-003',
    title: 'Midnight in Krakow',
    artist: 'The Blue Ravens',
    author: 'Mike Stone',
    genre: 'blues',
    language: 'en',
    originalKey: 'A',
    currentKey: 'A',
    capo: 0,
    bpm: 75,
    tags: ['blues', 'krakow', 'night'],
    isFavorite: true,
    scrollSpeed: 35,
    fontSize: 18,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
    content: `[Verse 1]
A7
It's midnight in Krakow, the cobblestones are wet
D7                          A7
The trumpeter's playing a tune I can't forget
E7              D7
I walked the old market square alone tonight
A7          E7
Looking for something I can't put right

[Chorus]
A7           D7
Midnight in Krakow, the blues got me down
D7                    A7
Midnight in Krakow, in this beautiful town
E7              D7
Pour me another, let the music play
A7       E7        A7
Tomorrow I'm leaving, but tonight I'll stay

[Verse 2]
A7
The jazz club on Floriańska had a candle light
D7                          A7
A saxophonist playing through the whole long night
E7              D7
I ordered a pierogi and a glass of wine
A7          E7
Everything felt wrong but somehow right`,
  },
  {
    id: 'seed-004',
    title: 'Stary most',
    artist: 'Marek Zielony',
    genre: 'country',
    language: 'pl',
    originalKey: 'D',
    currentKey: 'D',
    capo: 2,
    bpm: 95,
    tags: ['country', 'most', 'rzeka'],
    isFavorite: false,
    scrollSpeed: 55,
    fontSize: 18,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    content: `[Zwrotka 1]
D              G
Na starym moście stoję sam
D                 A
Patrzę jak rzeka płynie tam
G              D
Pamiętam kiedy byłeś tu
A                    D
Teraz tylko wiatr i ja we dwu

[Refren]
G           D
Stary most, stary most
A              D
Tyle lat, tyle słów
G           D
Wody płyną, czas ucieka
A                 D
A ja wciąż tu na ciebie czekam

[Outro]
D   G   D   A
D   G   A   D`,
  },
  {
    id: 'seed-005',
    title: 'Summer Never Ends',
    artist: 'Coastal Drive',
    genre: 'rock',
    language: 'en',
    originalKey: 'E',
    currentKey: 'E',
    capo: 0,
    bpm: 130,
    tags: ['rock', 'summer', 'upbeat'],
    isFavorite: false,
    scrollSpeed: 65,
    fontSize: 18,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7,
    content: `[Verse 1]
E              A
We hit the road at half past three
E                B
The windows down, the radio free
A              E
Not a cloud in the morning sky
B                    E
Felt like the summer would never die

[Pre-Chorus]
A              B
And everybody's singing
A              B
Like nothing's gonna change

[Chorus]
E           A
Summer never ends, summer never ends
B              C#m
We'll ride forever on these roads
A           E
Summer never ends, summer never ends
B                    E
Until the very last guitar chord

[Bridge]
C#m   A    E    B
C#m   A    B    E`,
  },
]
