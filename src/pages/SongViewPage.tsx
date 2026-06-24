import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Edit3, Maximize2, Zap, Heart, Type } from 'lucide-react'
import { useSongsStore } from '@/store/songsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { getShapeKey } from '@/utils/chords'
import SongRenderer from '@/components/SongRenderer'

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const songs = useSongsStore(s => s.songs)
  const transposeBy = useSongsStore(s => s.transposeBy)
  const toggleFavorite = useSongsStore(s => s.toggleFavorite)
  const { defaultFontSize } = useSettingsStore()

  const song = songs.find(s => s.id === id)
  const [fontSize, setFontSize] = useState(defaultFontSize)
  const [uiVisible, setUiVisible] = useState(true)

  useEffect(() => {
    if (song?.fontSize) setFontSize(song.fontSize)
  }, [song?.fontSize])

  if (!song) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
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
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-3 py-2">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white truncate leading-tight">{song.title}</h1>
              <p className="text-xs text-gray-500 truncate">{song.artist}</p>
            </div>
            <button onClick={() => toggleFavorite(song.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
              <Heart size={20} className={song.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
            <button onClick={() => navigate(`/song/${song.id}/stage`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0" title="Tryb sceniczny">
              <Zap size={20} className="text-amber-500" />
            </button>
            <button onClick={() => navigate(`/song/${song.id}/edit`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
              <Edit3 size={20} className="text-gray-500" />
            </button>
          </div>
        </header>
      )}

      {/* Treść piosenki - kliknięcie środka chowa/pokazuje UI */}
      <div
        className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full"
        onClick={() => setUiVisible(v => !v)}
      >
        <SongRenderer content={song.content} fontSize={fontSize} />
        <div className="h-36" />
      </div>

      {/* Bottom controls - 2 rzędy na małych ekranach */}
      {uiVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-3 py-2 flex flex-col gap-1">

            {/* Rząd 1: Transpozycja + Capo + Fullscreen */}
            <div className="flex items-center justify-between gap-2">

              {/* Transpozycja */}
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); transposeBy(song.id, -1) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-base hover:bg-amber-100 dark:hover:bg-amber-900/30 active:scale-95 transition-transform flex-shrink-0"
                >
                  −
                </button>
                <div className="text-center px-1 min-w-[64px]">
                  {currentKey ? (
                    <>
                      <p className="text-[10px] text-gray-400 leading-none">Tonacja</p>
                      <p className="font-mono font-bold text-amber-500 text-xl leading-tight">{currentKey}</p>
                      {song.originalKey && currentKey !== song.originalKey && (
                        <p className="text-[10px] text-gray-400 leading-none">org: {song.originalKey}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">–</p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); transposeBy(song.id, 1) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-base hover:bg-amber-100 dark:hover:bg-amber-900/30 active:scale-95 transition-transform flex-shrink-0"
                >
                  +
                </button>
              </div>

              {/* Capo info - kompaktowy */}
              {song.capo > 0 && shapeKey && (
                <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1">
                  <p className="text-[10px] text-gray-400 leading-none">Capo {song.capo}</p>
                  <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200 leading-tight">= {shapeKey}</p>
                </div>
              )}

              {/* Czcionka */}
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); setFontSize(f => Math.max(12, f - 2)) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                >
                  <Type size={12} />
                </button>
                <span className="text-xs text-gray-500 w-6 text-center tabular-nums">{fontSize}</span>
                <button
                  onClick={e => { e.stopPropagation(); setFontSize(f => Math.min(40, f + 2)) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                >
                  <Type size={16} />
                </button>
              </div>

              <button
                onClick={e => { e.stopPropagation(); document.documentElement.requestFullscreen?.() }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center flex-shrink-0"
                title="Pełny ekran"
              >
                <Maximize2 size={16} className="text-gray-400" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
