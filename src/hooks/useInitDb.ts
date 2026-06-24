import { useEffect } from 'react'
import { useSongsStore } from '@/store/songsStore'

export function useInitDb() {
  const loadSongs = useSongsStore(s => s.loadSongs)

  useEffect(() => {
    loadSongs()
  }, [loadSongs])
}
