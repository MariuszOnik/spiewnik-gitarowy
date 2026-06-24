import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/types'

interface SettingsState extends UserSettings {
  setTheme: (theme: UserSettings['theme']) => void
  setDefaultFontSize: (size: number) => void
  setDefaultScrollSpeed: (speed: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system' as UserSettings['theme'],
      defaultFontSize: 18,
      defaultScrollSpeed: 50,
      setTheme: (theme: UserSettings['theme']) => set({ theme }),
      setDefaultFontSize: (defaultFontSize: number) => set({ defaultFontSize }),
      setDefaultScrollSpeed: (defaultScrollSpeed: number) => set({ defaultScrollSpeed }),
    }),
    { name: 'spiewnik-settings' }
  )
)
