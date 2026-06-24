import { isChordLine, parseLine, contentToEuropean } from '@/utils/chords'
import { useSettingsStore } from '@/store/settingsStore'

interface Props {
  content: string
  fontSize: number
  chordOffset?: number  // kept for API compat
}

type Segment = { chord?: string; text: string }

function parseChordSegments(chordLine: string, lyricLine: string): Segment[] {
  const positions: Array<{ chord: string; pos: number }> = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(chordLine)) !== null) {
    positions.push({ chord: m[0], pos: m.index })
  }
  if (positions.length === 0) return [{ text: lyricLine }]

  // Find word-start positions in lyric line
  const wordStarts: number[] = []
  for (let j = 0; j < lyricLine.length; j++) {
    if (lyricLine[j] !== ' ' && (j === 0 || lyricLine[j - 1] === ' ')) {
      wordStarts.push(j)
    }
  }

  // Snap each chord position to nearest word boundary (<= chord pos)
  function snapToWord(pos: number): number {
    let best = 0
    for (const ws of wordStarts) {
      if (ws <= pos) best = ws
      else break
    }
    return best
  }

  // Map chords to word boundaries, deduplicate
  const seen = new Set<number>()
  const snapped: Array<{ chord: string; pos: number }> = []
  for (const { chord, pos } of positions) {
    const snappedPos = wordStarts.length > 0 ? snapToWord(pos) : pos
    if (!seen.has(snappedPos)) {
      snapped.push({ chord, pos: snappedPos })
      seen.add(snappedPos)
    }
  }

  const segments: Segment[] = []

  // Text before first chord
  if (snapped[0].pos > 0) {
    segments.push({ text: lyricLine.slice(0, snapped[0].pos) })
  }

  for (let i = 0; i < snapped.length; i++) {
    const { chord, pos } = snapped[i]
    const nextPos = i + 1 < snapped.length ? snapped[i + 1].pos : undefined
    const text = nextPos !== undefined ? lyricLine.slice(pos, nextPos) : lyricLine.slice(pos)
    segments.push({ chord, text })
  }

  return segments
}

export default function SongRenderer({ content, fontSize }: Props) {
  const chordNotation = useSettingsStore(s => s.chordNotation)
  const chordColor = useSettingsStore(s => s.chordColor)
  const lyricsColor = useSettingsStore(s => s.lyricsColor)

  const displayContent = chordNotation === 'european' ? contentToEuropean(content) : content
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
      i++; continue
    }

    // Naglowek sekcji [Verse 1]
    if (/^\[.+\]$/.test(trimmed) && !trimmed.slice(1, -1).match(/^[A-G][b#]?/)) {
      elements.push(
        <p key={i} className="font-bold uppercase tracking-widest mt-4 mb-1"
           style={{ fontSize: fontSize * 0.7, color: chordColor }}>
          {trimmed.slice(1, -1)}
        </p>
      )
      i++; continue
    }

    // Linie akordow - zbierz wszystkie kolejne
    if (isChordLine(origTrimmed)) {
      const chordLines: string[] = [trimmed]
      let j = i + 1
      while (
        j < lines.length &&
        lines[j].trim() &&
        isChordLine((originalLines[j] ?? lines[j]).trim())
      ) {
        chordLines.push(lines[j].trim())
        j++
      }

      const nextOrigLine = originalLines[j]
      const nextDispLine = lines[j]
      const hasLyric = nextDispLine !== undefined
        && nextDispLine.trim()
        && !isChordLine((nextOrigLine ?? nextDispLine).trim())

      if (hasLyric) {
        // Poprzednie linie akordow (jesli wiecej niz 1) wyswietl osobno
        for (let k = 0; k < chordLines.length - 1; k++) {
          elements.push(
            <div key={`chord-pre-${i}-${k}`}
                 className="font-mono font-bold whitespace-pre-wrap"
                 style={{ fontSize, color: chordColor }}>
              {chordLines[k]}
            </div>
          )
        }
        // Ostatnia linia akordow inline z tekstem
        const lastChordLine = chordLines[chordLines.length - 1]
        const segments = parseChordSegments(lastChordLine, nextDispLine)
        elements.push(
          <div key={i} className="mb-2">
            {segments.map((seg, si) => (
              <span
                key={si}
                className="relative inline-block"
                style={{ paddingTop: `${fontSize * 1.4}px`, verticalAlign: 'top' }}
              >
                {seg.chord && (
                  <span
                    className="absolute top-0 left-0 font-mono font-bold whitespace-nowrap leading-none"
                    style={{ fontSize, color: chordColor }}
                  >
                    {seg.chord}
                  </span>
                )}
                <span style={{ fontSize, color: lyricsColor || undefined }}>
                  {seg.text || ' '}
                </span>
              </span>
            ))}
          </div>
        )
        i = j + 1; continue
      }

      // Linie akordow bez tekstu
      for (let k = 0; k < chordLines.length; k++) {
        elements.push(
          <div key={`chord-${i}-${k}`}
               className="font-mono font-bold whitespace-pre-wrap mb-1"
               style={{ fontSize, color: chordColor }}>
            {chordLines[k]}
          </div>
        )
      }
      i = j; continue
    }

    // Format inline [Akord]tekst
    if (line.includes('[')) {
      const tokens = parseLine(line)
      elements.push(
        <div key={i} className="mb-1">
          <div
            className="font-mono font-bold leading-none whitespace-pre-wrap"
            style={{ fontSize: fontSize * 0.85, color: chordColor }}
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

    // Zwykla linia tekstu
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
