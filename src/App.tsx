import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import SongListPage from '@/pages/SongListPage'
import SongViewPage from '@/pages/SongViewPage'
import SongEditPage from '@/pages/SongEditPage'
import StagePage from '@/pages/StagePage'
import SetlistsPage from '@/pages/SetlistsPage'
import SetlistDetailPage from '@/pages/SetlistDetailPage'

export default function App() {
  const { theme } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SongListPage />} />
        <Route path="/song/:id" element={<SongViewPage />} />
        <Route path="/song/:id/edit" element={<SongEditPage />} />
        <Route path="/song/new" element={<SongEditPage />} />
        <Route path="/song/:id/stage" element={<StagePage />} />
        <Route path="/setlists" element={<SetlistsPage />} />
        <Route path="/setlist/:id" element={<SetlistDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
