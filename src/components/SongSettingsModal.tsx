import { X } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useSongsStore } from '@/store/songsStore'

const CHORD_PRESETS = [
  { label: 'Bursztyn',  value: '#f59e0b' },
  { label: 'Niebieski', value: '#3b82f6' },
  { label: 'Zielony',   value: '#22c55e' },
  { label: 'Różowy',    value: '#ec4899' },
  { label: 'Czerwony',  value: '#ef4444' },
  { label: 'Fiolet',    value: '#a855f7' },
  { label: 'Biały',     value: '#f9fafb' },
]

const LYRICS_PRESETS = [
  { label: 'Auto',    value: '' },
  { label: 'Biały',   value: '#f9fafb' },
  { label: 'Czarny',  value: '#111827' },
  { label: 'Szary',   value: '#9ca3af' },
  { label: 'Żółty',   value: '#fde68a' },
  { label: 'Kremowy', value: '#fef3c7' },
]

const BG_PRESETS = [
  { label: 'Auto',        value: '' },
  { label: 'Czarny',      value: '#000000' },
  { label: 'Ciemny',      value: '#111827' },
  { label: 'Granat',      value: '#1e1b4b' },
  { label: 'Biały',       value: '#ffffff' },
  { label: 'Kremowy',     value: '#fffbeb' },
]

interface ColorRowProps {
  label: string
  value: string
  presets: { label: string; value: string }[]
  onChange: (v: string) => void
  preview?: React.ReactNode
}

function ColorRow({ label, value, presets, onChange, preview }: ColorRowProps) {
  return (
    <section className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map(preset => (
          <button
            key={preset.label}
            title={preset.label}
            onClick={() => onChange(preset.value)}
            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: preset.value || '#e5e7eb',
              borderColor: value === preset.value ? '#ffffff' : 'transparent',
              outline: value === preset.value ? `2px solid ${preset.value || '#9ca3af'}` : 'none',
              outlineOffset: 2,
              color: preset.value ? 'transparent' : '#6b7280',
            }}
          >
            {!preset.value && 'A'}
          </button>
        ))}
        {/* Custom color picker */}
        <label
          className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative overflow-hidden"
          title="Własny kolor"
        >
          <input
            type="color"
            value={value || '#ffffff'}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <span className="text-gray-400 text-lg leading-none select-none pointer-events-none">+</span>
        </label>
      </div>
      {preview && <div className="mt-2">{preview}</div>}
    </section>
  )
}

interface Props {
  songId: string
  chordOffset: number
  onClose: () => void
}

export default function SongSettingsModal({ songId, chordOffset, onClose }: Props) {
  const chordColor   = useSettingsStore(s => s.chordColor)
  const lyricsColor  = useSettingsStore(s => s.lyricsColor)
  const bgColor      = useSettingsStore(s => s.bgColor)
  const setChordColor  = useSettingsStore(s => s.setChordColor)
  const setLyricsColor = useSettingsStore(s => s.setLyricsColor)
  const setBgColor     = useSettingsStore(s => s.setBgColor)
  const updateSong = useSongsStore(s => s.updateSong)

  const handleOffset = (v: number) => updateSong(songId, { chordOffset: v })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-t-2xl p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Uchwyt + zamknij */}
        <div className="flex items-center justify-between mb-5">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 absolute left-1/2 -translate-x-1/2 top-3" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Ustawienia wyświetlania</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Podgląd na żywo */}
        <div
          className="rounded-xl p-4 mb-5 border border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: bgColor || undefined }}
        >
          <p className="font-mono font-bold text-sm mb-0.5" style={{ color: chordColor }}>
            Em        H        A
          </p>
          <p className="text-sm" style={{ color: lyricsColor || undefined }}>
            A jeśli zabraknie na koncie pieniędzy
          </p>
        </div>

        {/* Kolor akordów */}
        <ColorRow
          label="Kolor akordów (globalny)"
          value={chordColor}
          presets={CHORD_PRESETS}
          onChange={setChordColor}
        />

        {/* Kolor tekstu */}
        <ColorRow
          label="Kolor tekstu / słów (globalny)"
          value={lyricsColor}
          presets={LYRICS_PRESETS}
          onChange={setLyricsColor}
          preview={
            <span className="text-xs text-gray-400">
              {lyricsColor ? lyricsColor : 'Auto — dopasowuje się do trybu ciemny/jasny'}
            </span>
          }
        />

        {/* Kolor tła */}
        <ColorRow
          label="Kolor tła (globalny)"
          value={bgColor}
          presets={BG_PRESETS}
          onChange={setBgColor}
          preview={
            <span className="text-xs text-gray-400">
              {bgColor ? bgColor : 'Auto — dopasowuje się do trybu ciemny/jasny'}
            </span>
          }
        />

        {/* Przesunięcie akordów */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Przesunięcie akordów — ta piosenka
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Przesuwa linie akordów w lewo/prawo względem tekstu
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOffset(Math.max(-80, chordOffset - 4))}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
            >−</button>
            <input
              type="range" min={-80} max={80} value={chordOffset}
              onChange={e => handleOffset(Number(e.target.value))}
              className="flex-1 h-1.5"
              style={{ accentColor: chordColor }}
            />
            <button
              onClick={() => handleOffset(Math.min(80, chordOffset + 4))}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
            >+</button>
            <span className="text-xs text-gray-500 w-10 text-right tabular-nums font-mono">
              {chordOffset > 0 ? '+' : ''}{chordOffset}px
            </span>
          </div>
          {chordOffset !== 0 && (
            <button
              onClick={() => handleOffset(0)}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
            >
              Reset do 0
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
