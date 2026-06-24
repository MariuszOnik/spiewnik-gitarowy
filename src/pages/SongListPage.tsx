import { Plus, Music2, Moon, Sun, Guitar, ListMusic, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useInitDb } from '@/hooks/useInitDb'
import { useSongsStore } from '@/store/songsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import SongCard from '@/components/SongCard'
import SearchBar from '@/components/SearchBar'

export default function SongListPage() {
  useInitDb()
  const navigate = useNavigate()
  const loading = useSongsStore(s => s.loading)
  const songs = useSongsStore(s => s.songs)
  const searchQuery = useSongsStore(s => s.searchQuery)
  const filterGenre = useSongsStore(s => s.filterGenre)
  const filterLanguage = useSongsStore(s => s.filterLanguage)
  const filterKey = useSongsStore(s => s.filterKey)

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return songs.filter(song => {
      if (filterGenre && song.genre !== filterGenre) return false
      if (filterLanguage && song.language !== filterLanguage) return false
      if (filterKey && song.currentKey !== filterKey && song.originalKey !== filterKey) return false
      if (q) {
        const haystack = [song.title, song.artist, ...(song.tags ?? []), song.content].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [songs, searchQuery, filterGenre, filterLanguage, filterKey])
  const { theme, setTheme } = useSettingsStore()
  const user = useAuthStore(s => s.user)

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header — pełna szerokość */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between max-w-2xl mx-auto px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Guitar size={24} className="text-amber-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Śpiewnik Gitarowy</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/setlists')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Setlisty" title="Setlisty"
            >
              <ListMusic size={20} className="text-blue-500" />
            </button>
            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 hover:bg-amber-600 transition-colors"
                title={user.email ?? 'Profil'}
              >
                {user.email?.slice(0, 2).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Zaloguj się"
              >
                <LogIn size={20} className="text-gray-400" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Przełącz motyw"
            >
              {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
            <button
              onClick={() => navigate('/song/new')}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <Plus size={18} />
              Dodaj
            </button>
          </div>
        </div>
      </header>

      {/* Treść — wyśrodkowana, białe tło jak karta */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-950 min-h-[calc(100vh-64px)] px-4 shadow-sm">
        {/* Search */}
        <div className="py-3">
          <SearchBar />
        </div>

        {/* Lista */}
        <main className="pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Music2 size={40} className="animate-pulse text-amber-500" />
              <p>Ładowanie...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Music2 size={48} className="text-gray-200 dark:text-gray-700" />
              <p className="text-lg font-medium">Brak piosenek</p>
              <p className="text-sm">Dodaj pierwszą piosenkę klikając Dodaj</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 px-1 mb-1">{filtered.length} {filtered.length === 1 ? 'piosenka' : 'piosenek'}</p>
              {filtered.map(song => <SongCard key={song.id} song={song} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
