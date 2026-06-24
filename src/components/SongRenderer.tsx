import { isChordLine, parseLine, contentToEuropean } from '@/utils/chords'
import { useSettingsStore } from '@/store/settingsStore'

interface Props {
  content: string
  fontSize: number
}

export default function SongRenderer({ content, fontSize }: Props) {
  const chordNotation = useSettingsStore(s => s.chordNotation)
  const displayContent = chordNotation === 'european' ? contentToEuropean(content) : content
  const lines = displayContent.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Pusta linia
    if (!trimmed) {
      elements.push(<div key={i} className="h-4" />)
      i++
      continue
    }

    // Nagłówek sekcji [Verse 1] / [Refren] itp.
    if (/^\[.+\]$/.test(trimmed) && !trimmed.slice(1, -1).match(/^[A-G][b#]?/)) {
      elements.push(
        <p key={i} className="font-bold text-amber-500 uppercase tracking-widest mt-4 mb-1"
           style={{ fontSize: fontSize * 0.7 }}>
          {trimmed.slice(1, -1)}
        </p>
      )
      i++; continue
    }

    // Linia akordów nad tekstem
    if (isChordLine(trimmed)) {
      const nextLine = lines[i + 1]
      const hasLyric = nextLine !== undefined && nextLine.trim() && !isChordLine(nextLine.trim())

      elements.push(
        <div key={i} style={{ marginBottom: hasLyric ? 0 : 8 }}>
          {/* whitespace-pre zachowuje oryginalne odstępy – zapobiega zawijaniu akordów */}
          <div
            className="font-mono font-bold text-amber-500 dark:text-amber-400 leading-none mb-0.5 whitespace-pre overflow-x-auto"
            style={{ fontSize }}
          >
            {trimmed}
          </div>
          {hasLyric && (
            <p className="text-gray-900 dark:text-gray-100 leading-snug whitespace-pre-wrap"
               style={{ fontSize }}>
              {nextLine}
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
            className="font-mono font-bold text-amber-500 dark:text-amber-400 leading-none whitespace-pre"
            style={{ fontSize: fontSize * 0.85 }}
          >
            {tokens.map((t, ti) =>
              t.type === 'chord'
                ? <span key={ti}>{t.value} </span>
                : <span key={ti} className="invisible" aria-hidden>{t.value.replace(/./g, ' ')}</span>
            )}
          </div>
          <p className="text-gray-900 dark:text-gray-100 leading-snug" style={{ fontSize }}>
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
      <p key={i} className="text-gray-900 dark:text-gray-100 leading-snug mb-1 whitespace-pre-wrap"
         style={{ fontSize }}>
        {line}
      </p>
    )
    i++
  }

  return <div className="font-mono">{elements}</div>
}
