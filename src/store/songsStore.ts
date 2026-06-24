import { create } from 'zustand'
import { db } from '@/db'
import { supabase } from '@/lib/supabase'
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
  syncAfterLogin: () => Promise<void>
}

function now() { return Date.now() }

async function getUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

async function pushToSupabase(song: Song, userId: string) {
  if (!supabase) return
  await supabase.from('songs').upsert({ id: song.id, user_id: userId, data: song, updated_at: song.updatedAt })
}

async function deleteFromSupabase(id: string) {
  if (!supabase) return
  await supabase.from('songs').delete().eq('id', id)
}

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
    const userId = await getUserId()
    if (userId) pushToSupabase(song, userId)
    return id
  },

  updateSong: async (id, data) => {
    const updated = { ...data, updatedAt: now() }
    await db.songs.update(id, updated)
    set(s => ({ songs: s.songs.map(song => song.id === id ? { ...song, ...updated } : song) }))
    const userId = await getUserId()
    if (userId) {
      const song = get().songs.find(s => s.id === id)
      if (song) pushToSupabase(song, userId)
    }
  },

  deleteSong: async (id) => {
    await db.songs.delete(id)
    set(s => ({ songs: s.songs.filter(song => song.id !== id) }))
    deleteFromSupabase(id)
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

  // Merge lokalnych piosenek z Supabase po zalogowaniu
  syncAfterLogin: async () => {
    if (!supabase) return
    const userId = await getUserId()
    if (!userId) return

    // 1. Pobierz zdalne piosenki
    const { data: remoteRows, error } = await supabase
      .from('songs')
      .select('id, data, updated_at')
      .eq('user_id', userId)

    if (error) { console.error('Sync error:', error); return }

    const remoteMap = new Map((remoteRows ?? []).map((r: { id: string; data: Song; updated_at: number }) => [r.id, r]))

    // 2. Pobierz lokalne piosenki
    const localSongs = await db.songs.toArray()
    const localMap = new Map(localSongs.map(s => [s.id, s]))

    // 3. Wyślij lokalne które są nowsze lub nie ma ich w remote
    const toUpsert = localSongs.filter(s => {
      const remote = remoteMap.get(s.id)
      return !remote || s.updatedAt > remote.updated_at
    })
    if (toUpsert.length > 0) {
      await supabase.from('songs').upsert(
        toUpsert.map(s => ({ id: s.id, user_id: userId, data: s, updated_at: s.updatedAt }))
      )
    }

    // 4. Pobierz zdalne które są nowsze lub nie ma ich lokalnie
    const toPull = (remoteRows ?? []).filter((r: { id: string; data: Song; updated_at: number }) => {
      const local = localMap.get(r.id)
      return !local || (r.data as Song).updatedAt > local.updatedAt
    })
    if (toPull.length > 0) {
      await db.songs.bulkPut(toPull.map((r: { data: Song }) => r.data as Song))
    }

    // 5. Odśwież store
    await get().loadSongs()
  },

  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterGenre: (filterGenre) => set({ filterGenre }),
  setFilterLanguage: (filterLanguage) => set({ filterLanguage }),
  setFilterKey: (filterKey) => set({ filterKey }),
}))
