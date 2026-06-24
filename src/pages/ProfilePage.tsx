import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, RefreshCw, User } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSongsStore } from '@/store/songsStore'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const signOut = useAuthStore(s => s.signOut)
  const syncAfterLogin = useSongsStore(s => s.syncAfterLogin)
  const songs = useSongsStore(s => s.songs)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)

  if (!user) {
    navigate('/auth')
    return null
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncDone(false)
    await syncAfterLogin()
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const displayName = user.user_metadata?.username ?? user.email ?? '??'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col max-w-2xl mx-auto px-4">
      <header className="flex items-center gap-3 pt-6 pb-4">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-xl text-gray-900 dark:text-white">Profil</h1>
      </header>

      {/* Avatar + email */}
      <div className="flex items-center gap-4 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
          <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-amber-500">{songs.length}</p>
          <p className="text-xs text-gray-400">Piosenek</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-amber-500">{songs.filter(s => s.isFavorite).length}</p>
          <p className="text-xs text-gray-400">Ulubionych</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 py-6">
        {isSupabaseConfigured && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
          >
            <RefreshCw size={20} className={`text-amber-500 ${syncing ? 'animate-spin' : ''}`} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {syncing ? 'Synchronizuję...' : syncDone ? 'Zsynchronizowano!' : 'Synchronizuj piosenki'}
              </p>
              <p className="text-xs text-gray-400">Łączy lokalne piosenki z chmurą</p>
            </div>
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
        >
          <LogOut size={20} className="text-red-500" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Wyloguj się</p>
            <p className="text-xs text-gray-400">Piosenki zostają na urządzeniu</p>
          </div>
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-4 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Tryb lokalny</p>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-500">
            Supabase nie jest skonfigurowany. Piosenki są przechowywane tylko na tym urządzeniu.
          </p>
        </div>
      )}
    </div>
  )
}
