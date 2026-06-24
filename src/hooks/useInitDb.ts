import { useEffect } from 'react'
import { db } from '@/db'
import { SEED_SONGS } from '@/db/seedSongs'
import { useSongsStore } from '@/store/songsStore'

export function useInitDb() {
  const loadSongs = useSongsStore(s => s.loadSongs)

  useEffect(() => {
    async function init() {
      const count = await db.songs.count()
      if (count === 0) {
        await db.songs.bulkPut(SEED_SONGS)
      }
      await loadSongs()
    }
    init()
  }, [loadSongs])
}
