import { isChordLine, parseLine } from '@/utils/chords'

interface Props {
  content: string
  fontSize: number
}

export default function SongRenderer({ content, fontSize }: Props) {
  const lines = content.split('\n')

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
        <p key={i} className="font-bold text-amber-500 uppercase tracking-widest mt-4 mb-1" style={{ fontSize: fontSize * 0.7 }}>
          {trimmed.slice(1, -1)}
        </p>
      )
      i++
      continue
    }

    // Linia akordów nad tekstem
    if (isChordLine(trimmed)) {
      const chords = trimmed.split(/\s+/).filter(Boolean)
      const nextLine = lines[i + 1]
      const hasLyric = nextLine !== undefined && nextLine.trim() && !isChordLine(nextLine.trim())

      elements.push(
        <div key={i} className="chord-row" style={{ marginBottom: hasLyric ? 0 : 8 }}>
          <div className="flex flex-wrap gap-x-4 gap-y-0 font-mono font-bold text-amber-500 dark:text-amber-400 leading-none mb-0.5" style={{ fontSize }}>
            {chords.map((chord, ci) => (
              <span key={ci}>{chord}</span>
            ))}
          </div>
          {hasLyric && (
            <p className="text-gray-900 dark:text-gray-100 leading-snug" style={{ fontSize }}>
              {nextLine}
            </p>
          )}
        </div>
      )

      i += hasLyric ? 2 : 1
      continue
    }

    // Linia inline [Chord]tekst
    if (line.includes('[')) {
      const tokens = parseLine(line)
      elements.push(
        <div key={i} className="mb-1">
          <div className="flex flex-wrap font-mono font-bold text-amber-500 dark:text-amber-400 leading-none" style={{ fontSize: fontSize * 0.85 }}>
            {tokens.map((t, ti) =>
              t.type === 'chord'
                ? <span key={ti} className="mr-2">{t.value}</span>
                : <span key={ti} className="invisible" aria-hidden>{t.value}</span>
            )}
          </div>
          <p className="text-gray-900 dark:text-gray-100 leading-snug" style={{ fontSize }}>
            {tokens.map((t, ti) =>
              t.type === 'text' ? <span key={ti}>{t.value}</span> : null
            )}
          </p>
        </div>
      )
      i++
      continue
    }

    // Zwykła linia tekstu
    elements.push(
      <p key={i} className="text-gray-900 dark:text-gray-100 leading-snug mb-1" style={{ fontSize }}>
        {line}
      </p>
    )
    i++
  }

  return <div className="font-mono">{elements}</div>
}
