import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,

  init: async () => {
    if (!supabase) { set({ loading: false }); return }

    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null })
    })
  },

  signIn: async (email, password) => {
    if (!supabase) return 'Supabase nie jest skonfigurowany'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  },

  signUp: async (email, password) => {
    if (!supabase) return 'Supabase nie jest skonfigurowany'
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
