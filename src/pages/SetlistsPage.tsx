import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ListMusic, Trash2, ArrowLeft, LogIn } from 'lucide-react'
import { useSetlistStore } from '@/store/setlistStore'
import { useAuthStore } from '@/store/authStore'

export default function SetlistsPage() {
  const navigate = useNavigate()
  const { setlists, loading, loadSetlists, createSetlist, deleteSetlist } = useSetlistStore()
  const user = useAuthStore(s => s.user)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { loadSetlists() }, [loadSetlists])

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    const id = await createSetlist(name)
    setNewName('')
    setCreating(false)
    navigate(`/setlist/${id}`)
  }

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto px-4">
      <header className="flex items-center gap-3 pt-6 pb-4 sticky top-0 bg-white dark:bg-gray-950 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Setlisty</h1>
          <p className="text-xs text-gray-400">Wspólne listy do grania</p>
        </div>
        {user ? (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm"
          >
            <Plus size={16} /> Nowa
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm text-gray-500"
          >
            <LogIn size={16} /> Zaloguj
          </button>
        )}
      </header>

      {creating && (
        <div className="mb-4 p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            placeholder='np. "Ognisko lipiec", "Próba czwartek"'
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button onClick={handleCreate} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-semibold">Utwórz</button>
          <button onClick={() => setCreating(false)} className="px-2 py-1 text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      <main className="flex-1 pb-8">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Ładowanie...</p>
        ) : setlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <ListMusic size={48} className="text-gray-200 dark:text-gray-700" />
            <p className="font-medium">Brak setlist</p>
            {user ? (
              <>
                <p className="text-sm text-center">Stwórz listę piosenek na ognisko,<br />próbę lub koncert</p>
                <button onClick={() => setCreating(true)} className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold">
                  + Utwórz pierwszą setlistę
                </button>
              </>
            ) : (
              <p className="text-sm text-center">Zaloguj się, żeby tworzyć setlisty</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {setlists.map(sl => (
              <div
                key={sl.id}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/setlist/${sl.id}`)}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <ListMusic size={20} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{sl.name}</p>
                  <p className="text-xs text-gray-400">{sl.songIds.length} {sl.songIds.length === 1 ? 'piosenka' : 'piosenek'}</p>
                </div>
                {user && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteSetlist(sl.id) }}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
