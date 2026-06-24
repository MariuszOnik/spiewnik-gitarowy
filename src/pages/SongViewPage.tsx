import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { ArrowLeft, Edit3, Maximize2, Zap, Heart, Type, Play, Pause, SlidersHorizontal, ChevronLeft, ChevronRight, PlusCircle, Music2 } from 'lucide-react'
import { useSongsStore } from '@/store/songsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { getShapeKey } from '@/utils/chords'
import SongRenderer from '@/components/SongRenderer'
import SongSettingsModal from '@/components/SongSettingsModal'
import { useAutoScroll } from '@/hooks/useAutoScroll'

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const songs = useSongsStore(s => s.songs)
  const loading = useSongsStore(s => s.loading)
  const transposeBy = useSongsStore(s => s.transposeBy)
  const changeCapo = useSongsStore(s => s.changeCapo)
  const toggleFavorite = useSongsStore(s => s.toggleFavorite)
  const updateSong = useSongsStore(s => s.updateSong)
  const { defaultFontSize, defaultScrollSpeed, chordNotation, setChordNotation, bgColor } = useSettingsStore()
  const user = useAuthStore(s => s.user)

  const song = songs.find(s => s.id === id)

  const versions = useMemo(() => {
    if (!song?.songKey) return song ? [song] : []
    return songs
      .filter(s => s.songKey === song.songKey)
      .sort((a, b) => a.createdAt - b.createdAt)
  }, [songs, song])

  const versionIndex = versions.findIndex(v => v.id === id)

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

  useEffect(() => {
    if (!isScrolling) return
    const t = setTimeout(() => setUiVisible(false), 3000)
    return () => clearTimeout(t)
  }, [isScrolling])

  const handleSpeedChange = (v: number) => {
    const clamped = Math.max(1, Math.min(100, v))
    setScrollSpeed(clamped)
    saveScrollSpeed(clamped)
  }

  // Pokazuj spinner gdy dane sie jeszcze laduja (np. po odswiezeniu strony)
  if (!song) {
    if (loading || songs.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
          <Music2 size={40} className="animate-pulse text-amber-500" />
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Piosenka nie znaleziona</p>
          <button onClick={() => navigate('/')} className="text-amber-500 underline">Wróć do listy</button>
        </div>
      </div>
    )
  }

  const currentKey = song.currentKey ?? song.originalKey
  const shapeKey = currentKey && song.capo > 0 ? getShapeKey(currentKey, song.capo) : null
  const isOwner = !song.authorId || user?.id === song.authorId

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col" style={bgColor ? { backgroundColor: bgColor } : undefined}>

      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
          <span className="text-white font-bold" style={{ fontSize: 120, lineHeight: 1 }}>{countdown}</span>
        </div>
      )}

      {uiVisible && (
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-3 py-2">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
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
            {isOwner && (
              <button onClick={() => navigate(`/song/${song.id}/edit`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
                <Edit3 size={20} className="text-gray-500" />
              </button>
            )}
          </div>
        </header>
      )}

      {uiVisible && (versions.length > 1 || song.authorName) && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800/30">
          <button
            onClick={() => navigate(`/song/${versions[versionIndex - 1].id}`)}
            disabled={versionIndex <= 0}
            className="p-1 rounded disabled:opacity-30 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <ChevronLeft size={16} className="text-amber-600 dark:text-amber-400" />
          </button>
          <div className="flex-1 text-center text-xs text-amber-700 dark:text-amber-400">
            {song.authorName && <span className="font-medium">by {song.authorName}</span>}
            {versions.length > 1 && (
              <span className="ml-1 opacity-60">· {versionIndex + 1}/{versions.length}</span>
            )}
          </div>
          <button
            onClick={() => navigate(`/song/${versions[versionIndex + 1].id}`)}
            disabled={versionIndex >= versions.length - 1}
            className="p-1 rounded disabled:opacity-30 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <ChevronRight size={16} className="text-amber-600 dark:text-amber-400" />
          </button>
          {user && (
            <button
              onClick={() => navigate(`/song/new?fork=${song.id}`)}
              className="ml-1 p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              title="Dodaj swoją wersję"
            >
              <PlusCircle size={16} className="text-amber-500" />
            </button>
          )}
        </div>
      )}

      {settingsOpen && (
        <SongSettingsModal
          songId={song.id}
          chordOffset={song.chordOffset ?? 0}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <div
        className="flex-1 px-4 py-4 max-w-5xl mx-auto w-full"
        onClick={() => setUiVisible(v => !v)}
      >
        <SongRenderer content={song.content} fontSize={fontSize} chordOffset={song.chordOffset ?? 0} />
        <div className="h-48" />
      </div>

      {uiVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
          <div className="max-w-lg mx-auto px-3 pt-2.5 pb-3 flex flex-col gap-2" onClick={e => e.stopPropagation()}>

            {/* Wiersz 1: Tonacja | Capo */}
            <div className="flex items-stretch gap-2">
              <div className="flex-1 flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                <button
                  onClick={e => { e.stopPropagation(); transposeBy(song.id, -1) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 transition-all"
                >−</button>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 leading-none">Tonacja</p>
                  <p className="font-mono font-bold text-amber-500 text-lg leading-tight mt-0.5">
                    {currentKey ?? '—'}
                  </p>
                  {song.originalKey && currentKey !== song.originalKey && (
                    <p className="text-[9px] text-gray-400 leading-none">{song.originalKey}</p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); transposeBy(song.id, 1) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 transition-all"
                >+</button>
              </div>

              <div className="flex-1 flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                <button
                  onClick={e => { e.stopPropagation(); changeCapo(song.id, -1) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-all"
                >−</button>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 leading-none">Capo</p>
                  <p className="font-mono font-bold text-blue-500 dark:text-blue-400 text-lg leading-tight mt-0.5">{song.capo}</p>
                  {shapeKey && song.capo > 0 && (
                    <p className="text-[9px] text-gray-400 leading-none">={shapeKey}</p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); changeCapo(song.id, 1) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-all"
                >+</button>
              </div>
            </div>

            {/* Wiersz 2: Czcionka | Auto-scroll + tempo */}
            <div className="flex items-stretch gap-2">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
                <button
                  onClick={e => { e.stopPropagation(); setFontSize(f => Math.max(12, f - 2)) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
                ><Type size={11} /></button>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 leading-none">Czcionka</p>
                  <p className="font-mono font-bold text-gray-700 dark:text-gray-200 text-lg leading-tight mt-0.5 tabular-nums">{fontSize}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setFontSize(f => Math.min(40, f + 2)) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
                ><Type size={15} /></button>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
                <button
                  onClick={e => { e.stopPropagation(); handleSpeedChange(scrollSpeed - 5) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
                >−</button>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 leading-none">Tempo</p>
                  <p className="font-mono font-bold text-gray-700 dark:text-gray-200 text-lg leading-tight mt-0.5 tabular-nums">{scrollSpeed}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleSpeedChange(scrollSpeed + 5) }}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
                >+</button>
              </div>
            </div>

            {/* Wiersz 3: Auto scroll + fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={startWithCountdown}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isScrolling
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isScrolling ? <Pause size={16} /> : <Play size={16} />}
                {isScrolling ? 'Zatrzymaj' : 'Auto-scroll'}
              </button>
              <button
                onClick={e => { e.stopPropagation(); document.documentElement.requestFullscreen?.() }}
                className="w-11 h-11 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center flex-shrink-0"
                title="Pełny ekran"
              ><Maximize2 size={16} className="text-gray-400" /></button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
