import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/types'

interface SettingsState extends UserSettings {
  setTheme: (theme: UserSettings['theme']) => void
  setDefaultFontSize: (size: number) => void
  setDefaultScrollSpeed: (speed: number) => void
  setChordNotation: (n: UserSettings['chordNotation']) => void
  setChordColor: (color: string) => void
  setLyricsColor: (color: string) => void
  setBgColor: (color: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system' as UserSettings['theme'],
      defaultFontSize: 18,
      defaultScrollSpeed: 50,
      chordNotation: 'european' as UserSettings['chordNotation'],
      chordColor: '#f59e0b',
      lyricsColor: '',
      bgColor: '',
      setTheme: (theme: UserSettings['theme']) => set({ theme }),
      setDefaultFontSize: (defaultFontSize: number) => set({ defaultFontSize }),
      setDefaultScrollSpeed: (defaultScrollSpeed: number) => set({ defaultScrollSpeed }),
      setChordNotation: (chordNotation: UserSettings['chordNotation']) => set({ chordNotation }),
      setChordColor: (chordColor: string) => set({ chordColor }),
      setLyricsColor: (lyricsColor: string) => set({ lyricsColor }),
      setBgColor: (bgColor: string) => set({ bgColor }),
    }),
    { name: 'spiewnik-settings' }
  )
)
