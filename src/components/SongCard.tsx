import { Heart, Music2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSongsStore } from '@/store/songsStore'
import type { Song } from '@/types'

interface Props {
  song: Song
  versionCount?: number
}

export default function SongCard({ song, versionCount = 1 }: Props) {
  const navigate = useNavigate()
  const toggleFavorite = useSongsStore(s => s.toggleFavorite)

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform cursor-pointer"
      onClick={() => navigate(`/song/${song.id}`)}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Music2 size={20} className="text-amber-500" />
        </div>
        {versionCount > 1 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {versionCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">{song.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
        {song.authorName && (
          <p className="text-xs text-amber-600 dark:text-amber-400 truncate">by {song.authorName}</p>
        )}
        {song.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {song.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {song.originalKey && (
          <span className="text-xs font-mono font-bold text-amber-500 w-6 text-center">{song.currentKey ?? song.originalKey}</span>
        )}
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(song.id) }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={song.isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <Heart
            size={18}
            className={song.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300 dark:text-gray-600'}
          />
        </button>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
      </div>
    </div>
  )
}
