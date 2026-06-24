import { create } from 'zustand'
import { db } from '@/db'
import type { Setlist } from '@/types'
import { v4 as uuid } from '@lukeed/uuid'

interface SetlistState {
  setlists: Setlist[]
  loading: boolean
  loadSetlists: () => Promise<void>
  createSetlist: (name: string, description?: string) => Promise<string>
  updateSetlist: (id: string, data: Partial<Omit<Setlist, 'id' | 'createdAt'>>) => Promise<void>
  deleteSetlist: (id: string) => Promise<void>
  addSongToSetlist: (setlistId: string, songId: string) => Promise<void>
  removeSongFromSetlist: (setlistId: string, songId: string) => Promise<void>
  moveSong: (setlistId: string, fromIdx: number, toIdx: number) => Promise<void>
}

function now() { return Date.now() }

export const useSetlistStore = create<SetlistState>()((set, get) => ({
  setlists: [],
  loading: false,

  loadSetlists: async () => {
    set({ loading: true })
    const setlists = await db.setlists.orderBy('updatedAt').reverse().toArray()
    set({ setlists, loading: false })
  },

  createSetlist: async (name, description) => {
    const id = uuid()
    const setlist: Setlist = { id, name, description, songIds: [], createdAt: now(), updatedAt: now() }
    await db.setlists.add(setlist)
    set(s => ({ setlists: [setlist, ...s.setlists] }))
    return id
  },

  updateSetlist: async (id, data) => {
    const updated = { ...data, updatedAt: now() }
    await db.setlists.update(id, updated)
    set(s => ({ setlists: s.setlists.map(sl => sl.id === id ? { ...sl, ...updated } : sl) }))
  },

  deleteSetlist: async (id) => {
    await db.setlists.delete(id)
    set(s => ({ setlists: s.setlists.filter(sl => sl.id !== id) }))
  },

  addSongToSetlist: async (setlistId, songId) => {
    const sl = get().setlists.find(s => s.id === setlistId)
    if (!sl || sl.songIds.includes(songId)) return
    const songIds = [...sl.songIds, songId]
    await get().updateSetlist(setlistId, { songIds })
  },

  removeSongFromSetlist: async (setlistId, songId) => {
    const sl = get().setlists.find(s => s.id === setlistId)
    if (!sl) return
    const songIds = sl.songIds.filter(id => id !== songId)
    await get().updateSetlist(setlistId, { songIds })
  },

  moveSong: async (setlistId, fromIdx, toIdx) => {
    const sl = get().setlists.find(s => s.id === setlistId)
    if (!sl) return
    const songIds = [...sl.songIds]
    const [moved] = songIds.splice(fromIdx, 1)
    songIds.splice(toIdx, 0, moved)
    await get().updateSetlist(setlistId, { songIds })
  },
}))
