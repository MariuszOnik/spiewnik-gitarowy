import { create } from 'zustand'
import { db } from '@/db'
import type { Song, NoteNames, Genre, Language } from '@/types'
import { transposeContent, getRealKey } from '@/utils/chords'
import { v4 as uuid } from '@lukeed/uuid'

interface SongsState {
  songs: Song[]
  loading: boolean
  searchQuery: string
  filterGenre: Genre | ''
  filterLanguage: Language | ''
  filterKey: NoteNames | ''
  loadSongs: () => Promise<void>
  addSong: (data: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateSong: (id: string, data: Partial<Song>) => Promise<void>
  deleteSong: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  transposeBy: (id: string, semitones: number) => Promise<void>
  changeCapo: (id: string, delta: number) => Promise<void>
  setSearch: (q: string) => void
  setFilterGenre: (g: Genre | '') => void
  setFilterLanguage: (l: Language | '') => void
  setFilterKey: (k: NoteNames | '') => void
}

function now() { return Date.now() }

export const useSongsStore = create<SongsState>()((set, get) => ({
  songs: [],
  loading: false,
  searchQuery: '',
  filterGenre: '',
  filterLanguage: '',
  filterKey: '',

  loadSongs: async () => {
    set({ loading: true })
    const songs = await db.songs.orderBy('updatedAt').reverse().toArray()
    set({ songs, loading: false })
  },

  addSong: async (data) => {
    const id = uuid()
    const song: Song = { ...data, id, createdAt: now(), updatedAt: now() }
    await db.songs.add(song)
    set(s => ({ songs: [song, ...s.songs] }))
    return id
  },

  updateSong: async (id, data) => {
    const updated = { ...data, updatedAt: now() }
    await db.songs.update(id, updated)
    set(s => ({ songs: s.songs.map(song => song.id === id ? { ...song, ...updated } : song) }))
  },

  deleteSong: async (id) => {
    await db.songs.delete(id)
    set(s => ({ songs: s.songs.filter(song => song.id !== id) }))
  },

  toggleFavorite: async (id) => {
    const song = get().songs.find(s => s.id === id)
    if (!song) return
    await get().updateSong(id, { isFavorite: !song.isFavorite })
  },

  transposeBy: async (id, semitones) => {
    const song = get().songs.find(s => s.id === id)
    if (!song) return
    const newContent = transposeContent(song.content, semitones)
    const currentKey = song.currentKey ?? song.originalKey
    const newCurrentKey = currentKey ? getRealKey(currentKey, semitones) : undefined
    await get().updateSong(id, { content: newContent, currentKey: newCurrentKey })
  },

  // Zmiana kapodastra: capo +1 → akordy -1 półton (ten sam dźwięk, inny kształt)
  changeCapo: async (id, delta) => {
    const song = get().songs.find(s => s.id === id)
    if (!song) return
    const newCapo = Math.max(0, Math.min(11, song.capo + delta))
    const capoDelta = newCapo - song.capo
    if (capoDelta === 0) return
    const newContent = transposeContent(song.content, -capoDelta)
    const currentKey = song.currentKey ?? song.originalKey
    const newCurrentKey = currentKey ? getRealKey(currentKey, 0) : undefined
    await get().updateSong(id, { capo: newCapo, content: newContent, currentKey: newCurrentKey })
  },

  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterGenre: (filterGenre) => set({ filterGenre }),
  setFilterLanguage: (filterLanguage) => set({ filterLanguage }),
  setFilterKey: (filterKey) => set({ filterKey }),
}))
