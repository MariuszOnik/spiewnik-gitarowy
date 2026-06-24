import { isChordLine, parseLine, contentToEuropean } from '@/utils/chords'
import { useSettingsStore } from '@/store/settingsStore'

interface Props {
  content: string
  fontSize: number
  chordOffset?: number
}

export default function SongRenderer({ content, fontSize, chordOffset = 0 }: Props) {
  const chordNotation = useSettingsStore(s => s.chordNotation)
  const chordColor = useSettingsStore(s => s.chordColor)
  const lyricsColor = useSettingsStore(s => s.lyricsColor)

  const displayContent = chordNotation === 'european' ? contentToEuropean(content) : content

  // Używamy ORYGINALNYCH linii do detekcji akordów (isValidChord nie zna Dis/Gis),
  // a linii wyświetlanych (europejskich) do renderowania.
  const originalLines = content.split('\n')
  const lines = displayContent.split('\n')

  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const origLine = originalLines[i] ?? line
    const trimmed = line.trim()
    const origTrimmed = origLine.trim()

    // Pusta linia
    if (!trimmed) {
      elements.push(<div key={i} className="h-4" />)
      i++
      continue
    }

    // Nagłówek sekcji [Verse 1] / [Refren] itp.
    if (/^\[.+\]$/.test(trimmed) && !trimmed.slice(1, -1).match(/^[A-G][b#]?/)) {
      elements.push(
        <p key={i} className="font-bold uppercase tracking-widest mt-4 mb-1"
           style={{ fontSize: fontSize * 0.7, color: chordColor }}>
          {trimmed.slice(1, -1)}
        </p>
      )
      i++; continue
    }

    // Linia akordów nad tekstem – detekcja na oryginalnej linii
    if (isChordLine(origTrimmed)) {
      const nextOrigLine = originalLines[i + 1]
      const nextDispLine = lines[i + 1]
      const hasLyric = nextOrigLine !== undefined
        && nextOrigLine.trim()
        && !isChordLine(nextOrigLine.trim())

      elements.push(
        <div key={i} style={{ marginBottom: hasLyric ? 0 : 8 }}>
          <div
            className="font-mono font-bold leading-none mb-0.5 whitespace-pre overflow-x-auto"
            style={{ fontSize, color: chordColor, marginLeft: chordOffset || undefined }}
          >
            {trimmed}
          </div>
          {hasLyric && (
            <p className="leading-snug whitespace-pre-wrap"
               style={{ fontSize, color: lyricsColor || undefined }}>
              {nextDispLine}
            </p>
          )}
        </div>
      )

      i += hasLyric ? 2 : 1; continue
    }

    // Linia inline [Chord]tekst → akordy nad, tekst pod
    if (line.includes('[')) {
      const tokens = parseLine(line)
      elements.push(
        <div key={i} className="mb-1">
          <div
            className="font-mono font-bold leading-none whitespace-pre"
            style={{ fontSize: fontSize * 0.85, color: chordColor, marginLeft: chordOffset || undefined }}
          >
            {tokens.map((t, ti) =>
              t.type === 'chord'
                ? <span key={ti}>{t.value} </span>
                : <span key={ti} className="invisible" aria-hidden>{t.value.replace(/./g, ' ')}</span>
            )}
          </div>
          <p className="leading-snug" style={{ fontSize, color: lyricsColor || undefined }}>
            {tokens.map((t, ti) =>
              t.type === 'text' ? <span key={ti}>{t.value}</span> : null
            )}
          </p>
        </div>
      )
      i++; continue
    }

    // Zwykła linia tekstu
    elements.push(
      <p key={i} className="leading-snug mb-1 whitespace-pre-wrap"
         style={{ fontSize, color: lyricsColor || undefined }}>
        {line}
      </p>
    )
    i++
  }

  return <div className="font-mono">{elements}</div>
}
