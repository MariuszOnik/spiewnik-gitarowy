import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowLeft, Edit3, Maximize2, Zap, Heart, Type, Play, Pause, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useSongsStore } from '@/store/songsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { getShapeKey } from '@/utils/chords'
import SongRenderer from '@/components/SongRenderer'
import SongSettingsModal from '@/components/SongSettingsModal'
import { useAutoScroll } from '@/hooks/useAutoScroll'

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const songs = useSongsStore(s => s.songs)
  const transposeBy = useSongsStore(s => s.transposeBy)
  const changeCapo = useSongsStore(s => s.changeCapo)
  const toggleFavorite = useSongsStore(s => s.toggleFavorite)
  const updateSong = useSongsStore(s => s.updateSong)
  const { defaultFontSize, defaultScrollSpeed, chordNotation, setChordNotation, bgColor } = useSettingsStore()

  const song = songs.find(s => s.id === id)
  const [fontSize, setFontSize] = useState(song?.fontSize ?? defaultFontSize)
  const [scrollSpeed, setScrollSpeed] = useState(song?.scrollSpeed ?? defaultScrollSpeed)
  const [uiVisible, setUiVisible] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (song) {
      setFontSize(song.fontSize ?? defaultFontSize)
      setScrollSpeed(song.scrollSpeed ?? defaultScrollSpeed)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id])

  const saveScrollSpeed = useCallback((v: number) => {
    if (song) updateSong(song.id, { scrollSpeed: v })
  }, [song, updateSong])

  const { isScrolling, toggle, stop } = useAutoScroll({ speed: scrollSpeed })

  // Licznik 3-2-1 przed startem
  const startWithCountdown = useCallback(() => {
    if (isScrolling) { stop(); return }
    setCountdown(3)
    let n = 2
    const tick = () => {
      if (n > 0) {
        setCountdown(n--)
        countdownRef.current = setTimeout(tick, 800)
      } else {
        setCountdown(null)
        toggle()
      }
    }
    countdownRef.current = setTimeout(tick, 800)
  }, [isScrolling, stop, toggle])

  useEffect(() => () => { if (countdownRef.current) clearTimeout(countdownRef.current) }, [])

  // Ukryj UI automatycznie po 3s przewijania
  useEffect(() => {
    if (!isScrolling) return
    const t = setTimeout(() => setUiVisible(false), 3000)
    return () => clearTimeout(t)
  }, [isScrolling])

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

  const handleSpeedChange = (v: number) => {
    setScrollSpeed(v)
    saveScrollSpeed(v)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col" style={bgColor ? { backgroundColor: bgColor } : undefined}>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
          <span className="text-white font-bold" style={{ fontSize: 120, lineHeight: 1 }}>{countdown}</span>
        </div>
      )}

      {/* Top bar */}
      {uiVisible && (
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-3 py-2">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <button onClick={() => navigate('/')} className="p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
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
            <button
              onClick={() => setChordNotation(chordNotation === 'european' ? 'english' : 'european')}
              className="px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 font-mono text-xs font-bold text-gray-500"
              title="Zmień notację akordów"
            >
              {chordNotation === 'european' ? 'H' : 'B'}
            </button>
            <button
              onClick={e => { e.stopPropagation(); setSettingsOpen(true) }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
              title="Ustawienia wyświetlania"
            >
              <SlidersHorizontal size={20} className="text-gray-500" />
            </button>
            <button onClick={() => navigate(`/song/${song.id}/edit`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
              <Edit3 size={20} className="text-gray-500" />
            </button>
          </div>
        </header>
      )}

      {/* Modal ustawień */}
      {settingsOpen && (
        <SongSettingsModal
          songId={song.id}
          chordOffset={song.chordOffset ?? 0}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Treść - kliknięcie toggleuje UI */}
      <div
        className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full"
        onClick={() => setUiVisible(v => !v)}
      >
        <SongRenderer content={song.content} fontSize={fontSize} chordOffset={song.chordOffset ?? 0} />
        <div className="h-40" />
      </div>

      {/* Bottom controls */}
      {uiVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-3 py-2 flex flex-col gap-2">

            {/* Rząd 1: Transpozycja | Capo | Czcionka | Fullscreen */}
            <div className="flex items-center justify-between gap-1">

              {/* Transpozycja */}
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); transposeBy(song.id, -1) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 active:scale-95 transition-transform"
                >−</button>
                <div className="text-center px-1 min-w-[56px]">
                  {currentKey && (
                    <>
                      <p className="text-[10px] text-gray-400 leading-none">Tonacja</p>
                      <p className="font-mono font-bold text-amber-500 text-lg leading-tight">{currentKey}</p>
                      {song.originalKey && currentKey !== song.originalKey && (
                        <p className="text-[10px] text-gray-400 leading-none">org: {song.originalKey}</p>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); transposeBy(song.id, 1) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 active:scale-95 transition-transform"
                >+</button>
              </div>

              {/* Capo +/- */}
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); changeCapo(song.id, -1) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-95 transition-transform"
                >−</button>
                <div className="text-center px-1 min-w-[52px]">
                  <p className="text-[10px] text-gray-400 leading-none">Capo</p>
                  <p className="font-mono font-bold text-blue-500 dark:text-blue-400 text-lg leading-tight">{song.capo}</p>
                  {shapeKey && song.capo > 0 && (
                    <p className="text-[10px] text-gray-400 leading-none">= {shapeKey}</p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); changeCapo(song.id, 1) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-95 transition-transform"
                >+</button>
              </div>

              {/* Czcionka */}
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); setFontSize(f => Math.max(12, f - 2)) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-95 transition-transform"
                ><Type size={11} /></button>
                <span className="text-xs text-gray-500 w-6 text-center tabular-nums">{fontSize}</span>
                <button
                  onClick={e => { e.stopPropagation(); setFontSize(f => Math.min(40, f + 2)) }}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-95 transition-transform"
                ><Type size={15} /></button>
              </div>

              <button
                onClick={e => { e.stopPropagation(); document.documentElement.requestFullscreen?.() }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center flex-shrink-0"
              ><Maximize2 size={15} className="text-gray-400" /></button>
            </div>

            {/* Rząd 2: Auto-scroll */}
            <div className="flex items-center gap-2 pb-1" onClick={e => e.stopPropagation()}>
              {/* Play/Stop */}
              <button
                onClick={startWithCountdown}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 ${
                  isScrolling
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}
              >
                {isScrolling ? <Pause size={15} /> : <Play size={15} />}
                {isScrolling ? 'Stop' : 'Auto'}
              </button>

              {/* Prędkość - suwak */}
              <div className="flex items-center gap-1.5 flex-1">
                <button
                  onClick={() => handleSpeedChange(Math.max(1, scrollSpeed - 5))}
                  className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                ><ChevronDown size={14} /></button>
                <input
                  type="range"
                  min={1} max={100}
                  value={scrollSpeed}
                  onChange={e => handleSpeedChange(Number(e.target.value))}
                  className="flex-1 accent-amber-500 h-1.5"
                />
                <button
                  onClick={() => handleSpeedChange(Math.min(100, scrollSpeed + 5))}
                  className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                ><ChevronUp size={14} /></button>
                <span className="text-xs text-gray-400 w-6 text-right tabular-nums">{scrollSpeed}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
