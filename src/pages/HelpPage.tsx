import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Music2, ListMusic, Key, User, Tag, Hash, Type, Play, GitBranch } from 'lucide-react'

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-500">{icon}</span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2 pl-7">
        {children}
      </div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}

export default function HelpPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pomoc / Manual</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        <Section icon={<User size={20} />} title="Konto i logowanie">
          <p>Przeglądanie piosenek jest <strong>publiczne</strong> — nie musisz się logować.</p>
          <p>Aby <strong>dodawać i edytować piosenki oraz setlisty</strong> musisz założyć konto. Kliknij ikonę osoby w prawym górnym rogu i zarejestruj się.</p>
          <p>Podczas rejestracji podaj <strong>nazwę użytkownika</strong> (nick) — ona będzie widoczna publiczne przy Twoich piosenkach, nie email.</p>
        </Section>

        <Section icon={<Music2 size={20} />} title="Dodawanie piosenek">
          <p>Kliknij przycisk <strong>Dodaj</strong> (widoczny po zalogowaniu) na głównej liście.</p>
          <p>Wypełnij pola: <strong>Tytuł</strong>, <strong>Wykonawca</strong> (obowiązkowe). Reszta jest opcjonalna.</p>
          <p>Jeśli piosenka o takim tytule i wykonawcy już istnieje, Twoja wersja pojawi się jako <strong>kolejna wersja</strong> — możesz przełączać się między nimi strzałkami <Code>‹ ›</Code> w widoku piosenki.</p>
        </Section>

        <Section icon={<Type size={20} />} title="Format zapisu piosenki (akordy)">
          <p>Akordy piszesz w wierszu <strong>nad</strong> tekstem — tak jak w tradycyjnym zapisie gitarowym:</p>
          <pre className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-xs font-mono mt-2 overflow-x-auto text-gray-800 dark:text-gray-200">
{`C         G
Wpisz tutaj słowa piosenki
Am        F
A tutaj kolejny wers`}
          </pre>
          <p className="mt-2">Sekcje (zwrotka, refren) zapisujesz w nawiasach kwadratowych:</p>
          <pre className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-xs font-mono mt-1 overflow-x-auto text-gray-800 dark:text-gray-200">
{`[Zwrotka 1]
C     G
tekst...

[Refren]
F     C
tekst...`}
          </pre>
          <p className="mt-2">Wielkość liter w akordach <strong>nie ma znaczenia</strong> — <Code>am</Code> i <Code>Am</Code> to to samo.</p>
        </Section>

        <Section icon={<Tag size={20} />} title="Metatagi piosenki">
          <p>Podczas edycji możesz wypełnić dodatkowe informacje:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Tonacja oryginalna</strong> — np. <Code>C</Code>, <Code>G</Code>, <Code>Am</Code></li>
            <li><strong>Capo</strong> — pozycja kapodastru</li>
            <li><strong>BPM</strong> — tempo w uderzeniach na minutę</li>
            <li><strong>Gatunek</strong> — folk, rock, pop itp.</li>
            <li><strong>Język</strong> — polski, angielski itp.</li>
            <li><strong>Tagi</strong> — własne słowa kluczowe oddzielone przecinkami, np. <Code>ognisko, ballada, łatwa</Code></li>
            <li><strong>Link YouTube</strong> — opcjonalny link do nagrania lub podkładu. Po zapisaniu w nagłówku piosenki pojawi się czerwony przycisk <Code>YT</Code> otwierający film.</li>
          </ul>
          <p className="mt-2">Tagi służą do wyszukiwania — wpisz dowolny tag w polu wyszukiwania na liście.</p>
        </Section>

        <Section icon={<Key size={20} />} title="Zmiana tonacji i Capo">
          <p>W widoku piosenki (dolny pasek) masz:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Tonacja</strong> — przyciski <Code>−</Code> / <Code>+</Code> transponują wszystkie akordy o półton w górę lub dół</li>
            <li><strong>Capo</strong> — ustawia pozycję kapodastru; obok wyświetla się tonacja chwytów (np. Capo 2 + G = grasz G ale brzmi A)</li>
          </ul>
          <p className="mt-2">Transponujesz na czas sesji — zmiany są zapisywane do piosenki.</p>
        </Section>

        <Section icon={<Hash size={20} />} title="Notacja akordów H/B">
          <p>Przycisk <Code>H</Code> / <Code>B</Code> w nagłówku widoku piosenki przełącza między:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>H</strong> — notacja europejska (polska): B = <Code>H</Code>, Bb = <Code>B</Code></li>
            <li><strong>B</strong> — notacja angielska: B = <Code>B</Code>, Bb = <Code>Bb</Code></li>
          </ul>
        </Section>

        <Section icon={<Play size={20} />} title="Auto-scroll">
          <p>Przycisk <strong>Auto-scroll</strong> uruchamia automatyczne przewijanie strony — przydatne podczas grania.</p>
          <p>Przycisk <strong>Tempo</strong> (<Code>−</Code> / <Code>+</Code>) reguluje prędkość przewijania (1–100).</p>
          <p>Dotknij ekranu (lub kliknij myszką) w dowolnym miejscu tekstu piosenki, żeby <strong>pokazać lub ukryć pasek narzędzi i nagłówek</strong> — przydatne podczas grania na scenie.</p>
          <p>Przycisk <Code>⚡</Code> otwiera <strong>tryb sceniczny</strong> — duża czcionka, ciemne tło, minimalistyczny widok.</p>
        </Section>

        <Section icon={<ListMusic size={20} />} title="Setlisty">
          <p>Setlisty to uporządkowane listy piosenek na dany koncert, ognisko lub próbę.</p>
          <p>Setlisty są <strong>publiczne</strong> — każdy może je zobaczyć. Tylko <strong>zalogowani użytkownicy</strong> mogą je tworzyć i edytować.</p>
          <p>Aby dodać setlistę, wejdź w <strong>ikonę listy</strong> w nagłówku głównego ekranu i kliknij <strong>Nowa</strong>.</p>
          <p>W setliście możesz zmieniać kolejność piosenek strzałkami ▲ ▼ i uruchomić tryb grania klikając <strong>Graj</strong>.</p>
        </Section>

        <Section icon={<GitBranch size={20} />} title="Wersje piosenki">
          <p>Kilku użytkowników może mieć swoje wersje tej samej piosenki (inny układ akordów, tonacja, tekst).</p>
          <p>Na liście piosenek obok tytułu pokazuje się liczba wersji — np. <Code>3</Code>.</p>
          <p>W widoku piosenki używaj strzałek <Code>‹ ›</Code> aby przełączać wersje. Kliknij <Code>⊕</Code> aby dodać własną wersję.</p>
        </Section>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400">Śpiewnik Gitarowy · Created by Mariusz Onik & Claude AI</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Wróć do listy piosenek
          </button>
        </div>

      </div>
    </div>
  )
}
