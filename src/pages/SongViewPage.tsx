import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Minus, Plus, Edit3, Maximize2, Zap, Heart } from 'lucide-react'
import { useSongsStore } from '@/store/songsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { getShapeKey } from '@/utils/chords'
import SongRenderer from '@/components/SongRenderer'

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { songs, transposeBy, toggleFavorite } = useSongsStore()
  const { defaultFontSize } = useSettingsStore()

  const song = songs.find(s => s.id === id)
  const [fontSize, setFontSize] = useState(defaultFontSize)
  const [uiVisible, setUiVisible] = useState(true)

  useEffect(() => {
    if (song?.fontSize) setFontSize(song.fontSize)
  }, [song?.fontSize])

  if (!song) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center gap-4">
        <p className="text-gray-500 mb-4">Piosenka nie znaleziona</p>
        <button onClick={() => navigate('/')} className="text-amber-500 underline">Wróć do listy</button>
      </div>
    </div>
  )

  const currentKey = song.currentKey ?? song.originalKey
  const shapeKey = currentKey && song.capo > 0 ? getShapeKey(currentKey, song.capo) : null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      {uiVisible && (
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white truncate">{song.title}</h1>
              <p className="text-sm text-gray-500 truncate">{song.artist}</p>
            </div>
            <button onClick={() => toggleFavorite(song.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Heart size={20} className={song.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
            <button onClick={() => navigate(`/song/${song.id}/stage`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Tryb sceniczny">
              <Zap size={20} className="text-amber-500" />
            </button>
            <button onClick={() => navigate(`/song/${song.id}/edit`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Edit3 size={20} className="text-gray-500" />
            </button>
          </div>
        </header>
      )}

      {/* Tap to toggle UI */}
      <div
        className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full"
        onClick={() => setUiVisible(v => !v)}
      >
        <SongRenderer content={song.content} fontSize={fontSize} />
        <div className="h-32" />
      </div>

      {/* Bottom controls */}
      {uiVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">

            {/* Transpozycja */}
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); transposeBy(song.id, -1) }}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                −
              </button>
              <div className="text-center px-2 min-w-[80px]">
                {currentKey && (
                  <>
                    <p className="text-xs text-gray-400">Tonacja</p>
                    <p className="font-mono font-bold text-amber-500 text-lg leading-none">{currentKey}</p>
                    {song.originalKey && currentKey !== song.originalKey && (
                      <p className="text-xs text-gray-400">org: {song.originalKey}</p>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); transposeBy(song.id, 1) }}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                +
              </button>
            </div>

            {/* Capo info */}
            {song.capo > 0 && shapeKey && (
              <div className="text-center">
                <p className="text-xs text-gray-400">Capo {song.capo}</p>
                <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">kształt {shapeKey}</p>
              </div>
            )}

            {/* Czcionka */}
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); setFontSize(f => Math.max(12, f - 2)) }}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm text-gray-500 w-8 text-center">{fontSize}</span>
              <button
                onClick={e => { e.stopPropagation(); setFontSize(f => Math.min(36, f + 2)) }}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={e => { e.stopPropagation(); document.documentElement.requestFullscreen?.() }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Pełny ekran"
            >
              <Maximize2 size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
