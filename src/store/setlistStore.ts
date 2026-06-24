import { create } from 'zustand'
import { db } from '@/db'
import { supabase } from '@/lib/supabase'
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

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export const useSetlistStore = create<SetlistState>()((set, get) => ({
  setlists: [],
  loading: false,

  loadSetlists: async () => {
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('setlists')
        .select('id, data, updated_at')
        .order('updated_at', { ascending: false })

      if (!error && data) {
        const setlists = (data as Array<{ id: string; data: Setlist; updated_at: number }>)
          .map(r => r.data)
        await db.setlists.clear()
        await db.setlists.bulkPut(setlists)
        set({ setlists, loading: false })
        return
      }
    }

    const setlists = await db.setlists.orderBy('updatedAt').reverse().toArray()
    set({ setlists, loading: false })
  },

  createSetlist: async (name, description) => {
    const id = uuid()
    const setlist: Setlist = { id, name, description, songIds: [], createdAt: now(), updatedAt: now() }

    if (supabase) {
      const userId = await getCurrentUserId()
      if (userId) {
        await supabase.from('setlists').insert({
          id: setlist.id,
          user_id: userId,
          data: setlist,
          updated_at: setlist.updatedAt,
        })
      }
    }

    await db.setlists.add(setlist)
    set(s => ({ setlists: [setlist, ...s.setlists] }))
    return id
  },

  updateSetlist: async (id, data) => {
    const updated = { ...data, updatedAt: now() }
    await db.setlists.update(id, updated)

    const existing = get().setlists.find(s => s.id === id)
    const setlist = existing ? { ...existing, ...updated } : null
    set(s => ({ setlists: s.setlists.map(sl => sl.id === id ? { ...sl, ...updated } : sl) }))

    if (supabase && setlist) {
      await supabase.from('setlists').update({ data: setlist, updated_at: setlist.updatedAt }).eq('id', id)
    }
  },

  deleteSetlist: async (id) => {
    await db.setlists.delete(id)
    set(s => ({ setlists: s.setlists.filter(sl => sl.id !== id) }))
    if (supabase) {
      await supabase.from('setlists').delete().eq('id', id)
    }
  },

  addSongToSetlist: async (setlistId, songId) => {
    const sl = get().setlists.find(s => s.id === setlistId)
    if (!sl || sl.songIds.includes(songId)) return
    await get().updateSetlist(setlistId, { songIds: [...sl.songIds, songId] })
  },

  removeSongFromSetlist: async (setlistId, songId) => {
    const sl = get().setlists.find(s => s.id === setlistId)
    if (!sl) return
    await get().updateSetlist(setlistId, { songIds: sl.songIds.filter(id => id !== songId) })
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
