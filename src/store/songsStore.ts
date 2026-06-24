import { create } from 'zustand'
import { db } from '@/db'
import { supabase } from '@/lib/supabase'
import type { Song, NoteNames, Genre, Language } from '@/types'
import { transposeContent, getRealKey } from '@/utils/chords'
import { makeSongKey } from '@/utils/songKey'
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

export const useSongsStore = create<SongsState>()((set, get) => ({
  songs: [],
  loading: false,
  searchQuery: '',
  filterGenre: '',
  filterLanguage: '',
  filterKey: '',

  loadSongs: async () => {
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('songs')
        .select('id, song_key, author_id, author_name, data, updated_at')
        .order('updated_at', { ascending: false })

      if (!error && data) {
        const songs: Song[] = (data as Array<{
          id: string; song_key: string; author_id: string | null
          author_name: string; data: Song; updated_at: number
        }>).map(r => ({
          ...r.data,
          songKey: r.song_key,
          authorId: r.author_id ?? undefined,
          authorName: r.author_name || undefined,
        }))
        await db.songs.clear()
        await db.songs.bulkPut(songs)
        set({ songs, loading: false })
        return
      }
    }

    const songs = await db.songs.orderBy('updatedAt').reverse().toArray()
    set({ songs, loading: false })
  },

  addSong: async (data) => {
    const id = uuid()
    const songKey = data.songKey ?? makeSongKey(data.title, data.artist)
    const song: Song = { ...data, id, songKey, createdAt: now(), updatedAt: now() }

    if (supabase) {
      const userId = await getUserId()
      if (userId) {
        await supabase.from('songs').insert({
          id: song.id,
          song_key: songKey,
          author_id: userId,
          author_name: song.authorName ?? '',
          data: song,
          updated_at: song.updatedAt,
        })
      }
    }

    await db.songs.add(song)
    set(s => ({ songs: [song, ...s.songs] }))
    return id
  },

  updateSong: async (id, data) => {
    const updated = { ...data, updatedAt: now() }
    await db.songs.update(id, updated)

    const existing = get().songs.find(s => s.id === id)
    const song = existing ? { ...existing, ...updated } : null
    set(s => ({ songs: s.songs.map(s2 => s2.id === id ? { ...s2, ...updated } : s2) }))

    if (supabase && song) {
      await supabase.from('songs').update({ data: song, updated_at: song.updatedAt }).eq('id', id)
    }
  },

  deleteSong: async (id) => {
    await db.songs.delete(id)
    set(s => ({ songs: s.songs.filter(song => song.id !== id) }))
    if (supabase) {
      await supabase.from('songs').delete().eq('id', id)
    }
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
    const newOffset = (song.transposeOffset ?? 0) + semitones
    await get().updateSong(id, { content: newContent, currentKey: newCurrentKey, transposeOffset: newOffset })
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

  syncAfterLogin: async () => {
    await get().loadSongs()
  },

  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterGenre: (filterGenre) => set({ filterGenre }),
  setFilterLanguage: (filterLanguage) => set({ filterLanguage }),
  setFilterKey: (filterKey) => set({ filterKey }),
}))
