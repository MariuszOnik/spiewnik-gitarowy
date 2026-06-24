import type { NoteNames } from '@/types'

const CHROMATIC: NoteNames[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const FLAT_TO_SHARP: Record<string, NoteNames> = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
}

// Normalizacja niestandardowej notacji → standard
// Obsługuje: notację niemiecką (H=B, B=Bb), polską małą literę (em→Em),
// skróty enharmoniczne (As=Ab=G#, Es=Eb=D#, Cis=C#, Dis=D# itp.)
const NOTATION_MAP: Record<string, string> = {
  // Notacja niemiecka
  H: 'B', h: 'B',
  B: 'A#', b: 'A#',           // w notacji ger. B = Bb
  // Enharmoniczne z -is / -es
  Cis: 'C#', cis: 'C#',
  Dis: 'D#', dis: 'D#',
  Fis: 'F#', fis: 'F#',
  Gis: 'G#', gis: 'G#',
  Ais: 'A#', ais: 'A#',
  Es: 'D#',  es: 'D#',
  As: 'G#',  as: 'G#',
  // Małe litery dla prostych akordów (a, e, d itp.) → wielka litera
  a: 'A', c: 'C', d: 'D', e: 'E', f: 'F', g: 'G',
}

/**
 * Normalizuje tekst piosenki: zamienia niestandardową notację akordów
 * na standard (C#, A#m itp.). Bezpieczna do wywołania przed zapisem.
 */
export function normalizeNotation(content: string): string {
  return content
    .split('\n')
    .map(line => {
      const trimmed = line.trim()
      if (!trimmed) return line

      // Normalizuj linie akordów (nad tekstem)
      const words = trimmed.split(/(\s+)/)
      const allChords = words.filter(w => w.trim()).every(w => isValidChordLoose(w))
      if (allChords && trimmed.includes(' ') || looksLikeChordLine(trimmed)) {
        return line.replace(/[^\s]+/g, token => normalizeChordToken(token))
      }

      // Normalizuj akordy inline [chord]
      if (line.includes('[')) {
        return line.replace(/\[([^\]]+)\]/g, (_, chord) => `[${normalizeChordToken(chord)}]`)
      }

      return line
    })
    .join('\n')
}

function looksLikeChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/)
  return tokens.length > 0 && tokens.every(t => isValidChordLoose(t))
}

function isValidChordLoose(token: string): boolean {
  if (!token) return false
  const normalized = normalizeChordToken(token)
  return isValidChord(normalized)
}

function normalizeChordToken(token: string): string {
  // Już poprawna notacja standard - nie ruszaj (zapobiega podwójnej normalizacji B→A#)
  if (isValidChord(token)) return token

  // Rozpoznaj root + modifier + bass
  const match = token.match(/^([A-Ha-h](?:is|es|[b#])?)((?:maj7|maj9|maj|min|m|sus2|sus4|sus|add9|add11|add|dim7|dim|aug|7|9|11|13|6)*)(?:\/([A-Ha-h](?:is|es|[b#])?))?$/)
  if (!match) return token

  const [, rawRoot, modifier, rawBass] = match
  const root = resolveRoot(rawRoot)
  if (!root) return token

  // Polska notacja gitarowa: mała litera pierwszego znaku = MOLOWY (minor)
  // h → Bm, fis → F#m, a → Am, e → Em, cis → C#m
  // Wyjątek: jeśli modifier jawnie zawiera już 'm', 'maj', 'min', 'sus' itp. – nie dodawaj
  const startsLowercase = rawRoot.charAt(0) === rawRoot.charAt(0).toLowerCase()
                       && rawRoot.charAt(0) !== rawRoot.charAt(0).toUpperCase()
  const hasExplicitQuality = modifier !== ''
  const shouldAddMinor = startsLowercase && !hasExplicitQuality

  const effectiveModifier = shouldAddMinor ? 'm' : (modifier ?? '')

  let result = root + effectiveModifier
  if (rawBass) {
    const bass = resolveRoot(rawBass)
    result += '/' + (bass ?? rawBass)
  }
  return result
}

function resolveRoot(raw: string): string | null {
  // Sprawdź mapę niestandardową
  if (raw in NOTATION_MAP) return NOTATION_MAP[raw]
  // Kapitalizuj pierwszą literę
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1)
  if (cap in NOTATION_MAP) return NOTATION_MAP[cap]
  if (cap in FLAT_TO_SHARP) return FLAT_TO_SHARP[cap as keyof typeof FLAT_TO_SHARP]
  if (CHROMATIC.includes(cap as NoteNames)) return cap
  return null
}

// Regex do rozpoznania pojedynczego akordu (bez spacji)
const SINGLE_CHORD_REGEX = /^([A-G][b#]?)((?:maj7|maj9|maj|min|m|sus2|sus4|sus|add9|add11|add|dim7|dim|aug|7|9|11|13|6|b5|#5)*)(?:\/([A-G][b#]?))?$/

function normalizeRoot(root: string): NoteNames | null {
  if (root in FLAT_TO_SHARP) return FLAT_TO_SHARP[root as keyof typeof FLAT_TO_SHARP]
  if (CHROMATIC.includes(root as NoteNames)) return root as NoteNames
  return null
}

function transposeRoot(root: NoteNames, semitones: number): NoteNames {
  const idx = CHROMATIC.indexOf(root)
  return CHROMATIC[((idx + semitones) % 12 + 12) % 12]
}

export function isValidChord(token: string): boolean {
  return SINGLE_CHORD_REGEX.test(token)
}

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord
  const match = chord.match(SINGLE_CHORD_REGEX)
  if (!match) return chord

  const [, rawRoot, modifier, rawBass] = match
  const root = normalizeRoot(rawRoot)
  if (!root) return chord

  const newRoot = transposeRoot(root, semitones)
  let result = newRoot + (modifier ?? '')

  if (rawBass) {
    const bass = normalizeRoot(rawBass)
    result += '/' + (bass ? transposeRoot(bass, semitones) : rawBass)
  }

  return result
}

/**
 * Sprawdza czy linia jest linią akordów:
 * - wszystkie tokeny (po splitcie spacją) muszą być poprawnymi akordami LUB pustymi stringami
 * - linia musi zawierać co najmniej jeden akord
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  const tokens = trimmed.split(/\s+/)
  return tokens.length > 0 && tokens.every(t => isValidChord(t))
}

/**
 * Transponuje linię akordów - zastępuje każdy akord jego transpozycją,
 * zachowując oryginalne odstępy między akordami.
 */
export function transposeChordLine(line: string, semitones: number): string {
  if (semitones === 0) return line
  return line.replace(/[A-G][b#]?(?:maj7|maj9|maj|min|m|sus2|sus4|sus|add9|add11|add|dim7|dim|aug|7|9|11|13|6|b5|#5)*(?:\/[A-G][b#]?)?/g, (chord) => {
    if (isValidChord(chord)) return transposeChord(chord, semitones)
    return chord
  })
}

/**
 * Transponuje cały tekst piosenki.
 * Obsługuje oba formaty:
 * 1. Linie akordów nad tekstem:  "C     G     Am"
 * 2. Inline (ChordPro):          "[C]słowo [G]słowo"
 */
export function transposeContent(content: string, semitones: number): string {
  if (semitones === 0) return content
  return content
    .split('\n')
    .map(line => {
      // Format: inline [Chord]
      if (line.includes('[')) {
        return line.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones)}]`)
      }
      // Format: linia akordów
      if (isChordLine(line)) {
        return transposeChordLine(line, semitones)
      }
      return line
    })
    .join('\n')
}

// Oblicz "Shape Key" - kształt jaki grasz na gitarze z kapodastrem
export function getShapeKey(currentKey: NoteNames, capo: number): NoteNames {
  const idx = CHROMATIC.indexOf(currentKey)
  return CHROMATIC[((idx - capo) % 12 + 12) % 12]
}

// Oblicz tonację realną z kształtu + capo (lub transpozycji – działa dla ujemnych wartości)
export function getRealKey(shapeKey: NoteNames, capo: number): NoteNames {
  const idx = CHROMATIC.indexOf(shapeKey)
  return CHROMATIC[((idx + capo) % 12 + 12) % 12]
}

// Parsowanie linii w formacie inline [Chord]tekst → tokeny
export type Token = { type: 'chord'; value: string } | { type: 'text'; value: string }

export function parseLine(line: string): Token[] {
  const tokens: Token[] = []
  const regex = /\[([^\]]+)\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: line.slice(lastIndex, match.index) })
    }
    tokens.push({ type: 'chord', value: match[1] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < line.length) {
    tokens.push({ type: 'text', value: line.slice(lastIndex) })
  }

  return tokens
}

/**
 * Parsowanie treści piosenki (format: akordy nad tekstem).
 * Zwraca pary { chords: string[], lyric: string }
 */
export type SongLine =
  | { type: 'chords'; chords: string[] }
  | { type: 'lyric'; text: string }
  | { type: 'chord-lyric'; chords: string[]; text: string }
  | { type: 'section'; label: string }
  | { type: 'empty' }

export function parseSongContent(content: string): SongLine[] {
  const rawLines = content.split('\n')
  const result: SongLine[] = []
  let i = 0

  while (i < rawLines.length) {
    const line = rawLines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      result.push({ type: 'empty' })
      i++
      continue
    }

    // Nagłówek sekcji: [Verse 1], [Chorus], [Bridge] itp.
    if (/^\[.+\]$/.test(trimmed) && !isValidChord(trimmed.slice(1, -1))) {
      result.push({ type: 'section', label: trimmed.slice(1, -1) })
      i++
      continue
    }

    // Linia akordów - sprawdź czy następna linia to tekst
    if (isChordLine(trimmed)) {
      const chords = trimmed.split(/\s+/).filter(Boolean)
      const nextLine = rawLines[i + 1]

      if (nextLine !== undefined && nextLine.trim() && !isChordLine(nextLine.trim())) {
        result.push({ type: 'chord-lyric', chords, text: nextLine })
        i += 2
      } else {
        result.push({ type: 'chords', chords })
        i++
      }
      continue
    }

    result.push({ type: 'lyric', text: line })
    i++
  }

  return result
}

// Konwersja notacji angielskiej → europejskiej (do wyświetlania)
// Przechowujemy w standardzie C#/A#/B, wyświetlamy jako Cis/B/H
const ROOT_TO_EUROPEAN: Record<string, string> = {
  'B': 'H', 'A#': 'B',                // B natural → H, Bb → B
  'C#': 'Cis', 'D#': 'Dis',
  'F#': 'Fis', 'G#': 'Gis',
  'Eb': 'Es', 'Ab': 'As',
  'Db': 'Des', 'Gb': 'Ges',
}

export function toEuropeanNotation(chord: string): string {
  // Zamień root, zachowaj modifier
  return chord.replace(/^([A-G][b#]?)/, root => ROOT_TO_EUROPEAN[root] ?? root)
}

// Wyświetla linie akordów w notacji europejskiej (nie zmienia danych w bazie)
export function contentToEuropean(content: string): string {
  const chordToken = /[A-G][b#]?(?:maj7|maj9|maj|min|m|sus2|sus4|sus|add9|add11|add|dim7|dim|aug|7|9|11|13|6|b5|#5)*(?:\/[A-G][b#]?)?/g
  return content
    .split('\n')
    .map(line => {
      if (isChordLine(line.trim())) {
        return line.replace(chordToken, chord => isValidChord(chord) ? toEuropeanNotation(chord) : chord)
      }
      if (line.includes('[')) {
        return line.replace(/\[([^\]]+)\]/g, (_, chord) => `[${toEuropeanNotation(chord)}]`)
      }
      return line
    })
    .join('\n')
}

export { CHROMATIC, type NoteNames }
