import Dexie, { type Table } from 'dexie'
import type { Song } from '@/types'

export class SpiewnikDB extends Dexie {
  songs!: Table<Song>

  constructor() {
    super('SpiewnikGitarowy')
    this.version(1).stores({
      songs: 'id, title, artist, genre, language, originalKey, isFavorite, updatedAt, *tags',
    })
  }
}

export const db = new SpiewnikDB()
