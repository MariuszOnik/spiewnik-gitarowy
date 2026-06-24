import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Play, Pause, ChevronUp, ChevronDown, Bluetooth } from 'lucide-react'
import { useSongsStore } from '@/store/songsStore'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { isChordLine, parseLine } from '@/utils/chords'

// Renderer zoptymalizowany pod tryb sceniczny - ogromne litery
function StageRenderer({ content, fontSize }: { content: string; fontSize: number }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      elements.push(<div key={i} className="h-6" />)
      i++
      continue
    }

    // Nagłówek sekcji
    if (/^\[.+\]$/.test(trimmed) && !trimmed.slice(1, -1).match(/^[A-G][b#]?/)) {
      elements.push(
        <p key={i} className="font-bold text-yellow-400 uppercase tracking-widest mt-6 mb-2"
           style={{ fontSize: fontSize * 0.55 }}>
          {trimmed.slice(1, -1)}
        </p>
      )
      i++; continue
    }

    // Linia akordów nad tekstem
    if (isChordLine(trimmed)) {
      const chords = trimmed.split(/\s+/).filter(Boolean)
      const nextLine = lines[i + 1]
      const hasLyric = nextLine !== undefined && nextLine.trim() && !isChordLine(nextLine.trim())

      elements.push(
        <div key={i} className="mb-2">
          <div className="flex flex-wrap gap-x-6 font-mono font-black text-yellow-400 leading-none mb-1"
               style={{ fontSize }}>
            {chords.map((c, ci) => <span key={ci}>{c}</span>)}
          </div>
          {hasLyric && (
            <p className="text-white font-semibold leading-tight" style={{ fontSize: fontSize * 1.15 }}>
              {nextLine}
            </p>
          )}
        </div>
      )
      i += hasLyric ? 2 : 1; continue
    }

    // Inline [Chord]tekst
    if (line.includes('[')) {
      const tokens = parseLine(line)
      elements.push(
        <div key={i} className="mb-2">
          <div className="flex flex-wrap font-mono font-black text-yellow-400 leading-none"
               style={{ fontSize: fontSize * 0.85 }}>
            {tokens.map((t, ti) =>
              t.type === 'chord'
                ? <span key={ti} className="mr-3">{t.value}</span>
                : <span key={ti} className="invisible" aria-hidden>{t.value}</span>
            )}
          </div>
          <p className="text-white font-semibold leading-tight" style={{ fontSize: fontSize * 1.1 }}>
            {tokens.map((t, ti) => t.type === 'text' ? <span key={ti}>{t.value}</span> : null)}
          </p>
        </div>
      )
      i++; continue
    }

    elements.push(
      <p key={i} className="text-white font-semibold leading-tight mb-1" style={{ fontSize: fontSize * 1.1 }}>
        {line}
      </p>
    )
    i++
  }

  return <div className="font-mono px-4 py-4">{elements}</div>
}

export default function StagePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const songs = useSongsStore(s => s.songs)
  const updateSong = useSongsStore(s => s.updateSong)

  const song = songs.find(s => s.id === id)
  const [fontSize, setFontSize] = useState(song?.fontSize ?? 32)
  const [scrollSpeed, setScrollSpeed] = useState(song?.scrollSpeed ?? 40)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [btActive, setBtActive] = useState(false)
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Wake Lock - ekran nie wygasza się
  useEffect(() => {
    async function acquireWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch { /* wake lock not supported */ }
    }
    acquireWakeLock()
    return () => { wakeLockRef.current?.release() }
  }, [])

  const { isScrolling, toggle, stop } = useAutoScroll({ speed: scrollSpeed })

  const saveSettings = useCallback((speed: number, size: number) => {
    if (song) updateSong(song.id, { scrollSpeed: speed, fontSize: size })
  }, [song, updateSong])

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
        setControlsVisible(false)
        toggle()
      }
    }
    countdownRef.current = setTimeout(tick, 800)
  }, [isScrolling, stop, toggle])

  // Auto-ukrywanie kontrolek
  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (isScrolling) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 4000)
    }
  }, [isScrolling])

  useEffect(() => {
    if (!isScrolling) setControlsVisible(true)
  }, [isScrolling])

  // Klawiatura + pedał BT (spacja, strzałki, PageDown/Up)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setBtActive(true)
      setTimeout(() => setBtActive(false), 500)

      switch (e.code) {
        case 'Space':
        case 'Enter':
          e.preventDefault()
          if (countdown !== null) return
          startWithCountdown()
          break
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          if (!isScrolling) startWithCountdown()
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          stop()
          window.scrollBy(0, -window.innerHeight * 0.4)
          break
        case 'ArrowRight':
          e.preventDefault()
          setScrollSpeed(s => { const v = Math.min(100, s + 5); saveSettings(v, fontSize); return v })
          break
        case 'ArrowLeft':
          e.preventDefault()
          setScrollSpeed(s => { const v = Math.max(1, s - 5); saveSettings(v, fontSize); return v })
          break
        case 'Escape':
          stop()
          navigate(`/song/${id}`)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [countdown, isScrolling, startWithCountdown, stop, navigate, id, saveSettings, fontSize])

  useEffect(() => () => {
    if (countdownRef.current) clearTimeout(countdownRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  if (!song) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <button onClick={() => navigate('/')} className="text-yellow-400 text-xl">← Wróć</button>
    </div>
  )

  return (
    <div className="bg-black min-h-screen relative" onClick={showControls}>

      {/* Countdown */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 pointer-events-none">
          <span className="text-yellow-400 font-black" style={{ fontSize: 180, lineHeight: 1 }}>
            {countdown}
          </span>
        </div>
      )}

      {/* BT pedał aktywny - flash */}
      {btActive && (
        <div className="fixed top-4 right-4 z-40 bg-blue-500 rounded-full p-2 animate-ping pointer-events-none">
          <Bluetooth size={16} className="text-white" />
        </div>
      )}

      {/* Treść */}
      <StageRenderer content={song.content} fontSize={fontSize} />
      <div className="h-screen" />

      {/* Overlay kontrolek - pojawia się po dotyku */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-black/90 border-t border-gray-700 px-4 py-3">

          {/* Rząd 1: info + wyjście */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold text-sm truncate">{song.title}</p>
              <p className="text-gray-400 text-xs">{song.artist}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-gray-500">
                <Bluetooth size={14} />
                <span className="text-xs">pedał: ⎵/↓</span>
              </div>
              <button
                onClick={() => { stop(); navigate(`/song/${id}`) }}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <X size={18} className="text-gray-300" />
              </button>
            </div>
          </div>

          {/* Rząd 2: Play + prędkość + czcionka */}
          <div className="flex items-center gap-3">

            {/* Play/Stop */}
            <button
              onClick={startWithCountdown}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm flex-shrink-0 transition-colors ${
                isScrolling
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-400 text-black'
              }`}
            >
              {isScrolling ? <Pause size={16} /> : <Play size={16} />}
              {isScrolling ? 'Stop' : 'Start'}
            </button>

            {/* Prędkość */}
            <div className="flex items-center gap-1 flex-1">
              <button
                onClick={() => { const v = Math.max(1, scrollSpeed - 5); setScrollSpeed(v); saveSettings(v, fontSize) }}
                className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center"
              ><ChevronDown size={14} className="text-gray-300" /></button>
              <input
                type="range" min={1} max={100} value={scrollSpeed}
                onChange={e => { const v = Number(e.target.value); setScrollSpeed(v); saveSettings(v, fontSize) }}
                className="flex-1 accent-yellow-400 h-1.5"
              />
              <button
                onClick={() => { const v = Math.min(100, scrollSpeed + 5); setScrollSpeed(v); saveSettings(v, fontSize) }}
                className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center"
              ><ChevronUp size={14} className="text-gray-300" /></button>
              <span className="text-xs text-gray-400 w-5 tabular-nums">{scrollSpeed}</span>
            </div>

            {/* Czcionka */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { const v = Math.max(20, fontSize - 4); setFontSize(v); saveSettings(scrollSpeed, v) }}
                className="w-8 h-8 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold flex items-center justify-center"
              >A−</button>
              <button
                onClick={() => { const v = Math.min(72, fontSize + 4); setFontSize(v); saveSettings(scrollSpeed, v) }}
                className="w-8 h-8 rounded-lg bg-gray-800 text-gray-300 text-base font-bold flex items-center justify-center"
              >A+</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
