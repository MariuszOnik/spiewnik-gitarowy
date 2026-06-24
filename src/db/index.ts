import Dexie, { type Table } from 'dexie'
import type { Song, Setlist } from '@/types'

export class SpiewnikDB extends Dexie {
  songs!: Table<Song>
  setlists!: Table<Setlist>

  constructor() {
    super('SpiewnikGitarowy')
    this.version(1).stores({
      songs: 'id, title, artist, genre, language, originalKey, isFavorite, updatedAt, *tags',
    })
    this.version(2).stores({
      songs: 'id, title, artist, genre, language, originalKey, isFavorite, updatedAt, *tags',
      setlists: 'id, name, updatedAt',
    })
  }
}

export const db = new SpiewnikDB()
