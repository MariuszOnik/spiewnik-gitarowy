import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, X, Play, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { useSetlistStore } from '@/store/setlistStore'
import { useSongsStore } from '@/store/songsStore'

export default function SetlistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setlists = useSetlistStore(s => s.setlists)
  const { loadSetlists, removeSongFromSetlist, moveSong, updateSetlist } = useSetlistStore()
  const songs = useSongsStore(s => s.songs)
  const addSongToSetlist = useSetlistStore(s => s.addSongToSetlist)

  const [showPicker, setShowPicker] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [playIdx, setPlayIdx] = useState<number | null>(null)

  useEffect(() => { loadSetlists() }, [loadSetlists])

  const setlist = setlists.find(s => s.id === id)

  useEffect(() => {
    if (setlist) setNameValue(setlist.name)
  }, [setlist?.name])

  if (!setlist) return (
    <div className="min-h-screen flex items-center justify-center">
      <button onClick={() => navigate('/setlists')} className="text-amber-500 underline">← Wróć do setlist</button>
    </div>
  )

  const setlistSongs = setlist.songIds.map(sid => songs.find(s => s.id === sid)).filter(Boolean) as typeof songs

  const availableSongs = songs.filter(s =>
    !setlist.songIds.includes(s.id) &&
    (pickerQuery === '' || s.title.toLowerCase().includes(pickerQuery.toLowerCase()) || s.artist.toLowerCase().includes(pickerQuery.toLowerCase()))
  )

  const saveName = () => {
    if (nameValue.trim() && id) updateSetlist(id, { name: nameValue.trim() })
    setEditingName(false)
  }

  // Tryb odtwarzania - nawiguj po piosenkach
  if (playIdx !== null) {
    const song = setlistSongs[playIdx]
    if (!song) { setPlayIdx(null); return null }
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950 z-10">
          <button onClick={() => setPlayIdx(null)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">{setlist.name} • {playIdx + 1}/{setlistSongs.length}</p>
            <p className="font-bold truncate">{song.title}</p>
          </div>
          <button
            onClick={() => navigate(`/song/${song.id}`)}
            className="text-xs text-amber-500 underline"
          >Otwórz</button>
        </header>
        {/* Mini-renderer */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">{song.content}</pre>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setPlayIdx(i => (i ?? 0) > 0 ? (i ?? 0) - 1 : i)}
            disabled={playIdx === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold text-sm disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Poprzednia
          </button>
          <span className="text-xs text-gray-400">{playIdx + 1} / {setlistSongs.length}</span>
          <button
            onClick={() => setPlayIdx(i => (i ?? 0) < setlistSongs.length - 1 ? (i ?? 0) + 1 : i)}
            disabled={playIdx === setlistSongs.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm disabled:opacity-30"
          >
            Następna <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto px-4">
      <header className="flex items-center gap-3 pt-6 pb-4 sticky top-0 bg-white dark:bg-gray-950 z-10">
        <button onClick={() => navigate('/setlists')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              autoFocus value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              className="font-bold text-xl bg-transparent outline-none border-b border-amber-500 w-full text-gray-900 dark:text-white"
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 group text-left">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{setlist.name}</h1>
              <Pencil size={14} className="text-gray-300 group-hover:text-amber-500 flex-shrink-0" />
            </button>
          )}
          <p className="text-xs text-gray-400">{setlistSongs.length} piosenek</p>
        </div>
        <div className="flex gap-2">
          {setlistSongs.length > 0 && (
            <button
              onClick={() => setPlayIdx(0)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm"
            >
              <Play size={15} /> Graj
            </button>
          )}
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold text-sm"
          >
            <Plus size={15} /> Dodaj
          </button>
        </div>
      </header>

      {/* Lista piosenek w setliście */}
      <main className="flex-1 pb-8">
        {setlistSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <p className="font-medium">Setlista jest pusta</p>
            <p className="text-sm">Dodaj piosenki klikając Dodaj</p>
            <button onClick={() => setShowPicker(true)} className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold">
              + Dodaj piosenkę
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {setlistSongs.map((song, idx) => (
              <div
                key={song.id}
                className="flex items-center gap-3 px-3 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                {/* Numer */}
                <span className="text-sm font-mono font-bold text-gray-300 dark:text-gray-600 w-6 text-center flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Przesuwanie */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => id && moveSong(id, idx, Math.max(0, idx - 1))}
                    disabled={idx === 0}
                    className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-amber-500 disabled:opacity-20"
                  >▲</button>
                  <button
                    onClick={() => id && moveSong(id, idx, Math.min(setlistSongs.length - 1, idx + 1))}
                    disabled={idx === setlistSongs.length - 1}
                    className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-amber-500 disabled:opacity-20"
                  >▼</button>
                </div>

                {/* Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/song/${song.id}`)}
                >
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>

                {song.originalKey && (
                  <span className="text-xs font-mono font-bold text-amber-500 flex-shrink-0">
                    {song.currentKey ?? song.originalKey}
                  </span>
                )}

                <button
                  onClick={() => id && removeSongFromSetlist(id, song.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Picker - dodaj piosenkę */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowPicker(false)}>
          <div
            className="bg-white dark:bg-gray-900 w-full max-h-[80vh] rounded-t-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <input
                autoFocus
                value={pickerQuery}
                onChange={e => setPickerQuery(e.target.value)}
                placeholder="Szukaj piosenki..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm outline-none"
              />
              <button onClick={() => setShowPicker(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-1.5">
              {availableSongs.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">
                  {songs.length === setlist.songIds.length ? 'Wszystkie piosenki są już na liście' : 'Brak wyników'}
                </p>
              ) : (
                availableSongs.map(song => (
                  <button
                    key={song.id}
                    onClick={async () => {
                      if (id) await addSongToSetlist(id, song.id)
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left transition-colors"
                  >
                    <Plus size={16} className="text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{song.title}</p>
                      <p className="text-xs text-gray-400">{song.artist}</p>
                    </div>
                    {song.originalKey && (
                      <span className="text-xs font-mono font-bold text-amber-500">{song.currentKey ?? song.originalKey}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
