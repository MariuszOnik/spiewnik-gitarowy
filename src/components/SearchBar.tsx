import { Search, X } from 'lucide-react'
import { useSongsStore } from '@/store/songsStore'

export default function SearchBar() {
  const { searchQuery, setSearch } = useSongsStore()

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={searchQuery}
        onChange={e => setSearch(e.target.value)}
        placeholder="Szukaj tytułu, wykonawcy, tagu..."
        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400"
      />
      {searchQuery && (
        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
