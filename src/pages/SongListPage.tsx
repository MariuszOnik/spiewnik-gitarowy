import { Plus, Music2, Moon, Sun, Guitar, ListMusic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useInitDb } from '@/hooks/useInitDb'
import { useSongsStore } from '@/store/songsStore'
import { useSettingsStore } from '@/store/settingsStore'
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

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto px-4">
      {/* Header */}
      <header className="flex items-center justify-between pt-safe pt-6 pb-4 sticky top-0 bg-white dark:bg-gray-950 z-10">
        <div className="flex items-center gap-2">
          <Guitar size={24} className="text-amber-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Śpiewnik Gitarowy</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/setlists')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Setlisty"
            title="Setlisty"
          >
            <ListMusic size={20} className="text-blue-500" />
          </button>
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
      </header>

      {/* Search */}
      <div className="pb-3">
        <SearchBar />
      </div>

      {/* Content */}
      <main className="flex-1 pb-8">
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
  )
}
