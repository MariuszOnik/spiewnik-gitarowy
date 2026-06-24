import { describe, it, expect } from 'vitest'
import {
  transposeChord, transposeContent, transposeChordLine,
  getShapeKey, getRealKey, parseLine, isChordLine, isValidChord, parseSongContent,
  normalizeNotation
} from './chords'

describe('isValidChord', () => {
  it('recognizes basic chords', () => {
    expect(isValidChord('C')).toBe(true)
    expect(isValidChord('Am')).toBe(true)
    expect(isValidChord('F#m')).toBe(true)
    expect(isValidChord('Bb')).toBe(true)
    expect(isValidChord('Cmaj7')).toBe(true)
    expect(isValidChord('G7')).toBe(true)
    expect(isValidChord('Dsus4')).toBe(true)
    expect(isValidChord('C/G')).toBe(true)
  })

  it('rejects non-chords', () => {
    expect(isValidChord('hello')).toBe(false)
    expect(isValidChord('As')).toBe(false)
    expect(isValidChord('')).toBe(false)
  })
})

describe('isChordLine', () => {
  it('detects chord-only lines', () => {
    expect(isChordLine('C  G  Am  F')).toBe(true)
    expect(isChordLine('G7   Dsus4')).toBe(true)
    expect(isChordLine('C/G  Am7')).toBe(true)
  })

  it('rejects lyric lines', () => {
    expect(isChordLine('As I was goin over')).toBe(false)
    expect(isChordLine('C Hello world')).toBe(false)
    expect(isChordLine('')).toBe(false)
  })
})

describe('transposeChord', () => {
  it('transposes major chords up', () => {
    expect(transposeChord('C', 1)).toBe('C#')
    expect(transposeChord('G', 1)).toBe('G#')
    expect(transposeChord('B', 1)).toBe('C')
  })

  it('transposes minor chords', () => {
    expect(transposeChord('Am', 1)).toBe('A#m')
    expect(transposeChord('Em', 2)).toBe('F#m')
  })

  it('transposes complex chords', () => {
    expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7')
    expect(transposeChord('G7', 1)).toBe('G#7')
    expect(transposeChord('Dsus4', 1)).toBe('D#sus4')
    expect(transposeChord('Aadd9', 3)).toBe('Cadd9')
  })

  it('transposes slash chords', () => {
    expect(transposeChord('C/G', 2)).toBe('D/A')
    expect(transposeChord('Am/E', 1)).toBe('A#m/F')
  })

  it('handles flat notation', () => {
    expect(transposeChord('Bb', 1)).toBe('B')
    expect(transposeChord('Eb', 2)).toBe('F')
  })

  it('transposes down', () => {
    expect(transposeChord('C', -1)).toBe('B')
    expect(transposeChord('D', -2)).toBe('C')
  })

  it('wraps around octave', () => {
    expect(transposeChord('C', 12)).toBe('C')
  })
})

describe('transposeChordLine', () => {
  it('transposes a chord line preserving spacing', () => {
    const line = 'C     G     Am    F'
    const result = transposeChordLine(line, 2)
    expect(result).toBe('D     A     Bm    G')
  })
})

describe('transposeContent', () => {
  it('transposes content with above-text chord lines', () => {
    const content = 'C     G     Am\nAs I was goin over the mountains'
    const result = transposeContent(content, 2)
    expect(result).toBe('D     A     Bm\nAs I was goin over the mountains')
  })

  it('transposes inline ChordPro format', () => {
    const content = '[C]As I was [G]goin over\n[Am]the mountains'
    const result = transposeContent(content, 2)
    expect(result).toBe('[D]As I was [A]goin over\n[Bm]the mountains')
  })
})

describe('getShapeKey / getRealKey', () => {
  it('calculates shape key from real key + capo', () => {
    expect(getShapeKey('A', 2)).toBe('G')
    expect(getShapeKey('G', 0)).toBe('G')
  })

  it('calculates real key from shape + capo', () => {
    expect(getRealKey('G', 2)).toBe('A')
    expect(getRealKey('A', 0)).toBe('A')
  })
})

describe('parseLine (inline format)', () => {
  it('parses mixed line', () => {
    const tokens = parseLine('[C]Hello [G]world')
    expect(tokens).toEqual([
      { type: 'chord', value: 'C' },
      { type: 'text', value: 'Hello ' },
      { type: 'chord', value: 'G' },
      { type: 'text', value: 'world' },
    ])
  })
})

describe('normalizeNotation - polska notacja gitarowa', () => {
  it('małe litery = molowe (lowercase = minor)', () => {
    expect(normalizeNotation('a  e  h')).toBe('Am  Em  Bm')
    expect(normalizeNotation('fis  cis  dis')).toBe('F#m  C#m  D#m')
    expect(normalizeNotation('h  fis')).toBe('Bm  F#m')
  })

  it('wielkie litery = durowe (uppercase = major)', () => {
    expect(normalizeNotation('A  E  H')).toBe('A  E  B')
    expect(normalizeNotation('Fis  Cis')).toBe('F#  C#')
  })

  it('zachowuje jawny modifier', () => {
    expect(normalizeNotation('am7')).toBe('Am7')
    expect(normalizeNotation('hm7')).toBe('Bm7')
    expect(normalizeNotation('esus4')).toBe('Esus4')
  })

  it('jest idempotentna (dwa razy = ten sam wynik)', () => {
    const once = normalizeNotation('h  fis  Hm  Fis')
    const twice = normalizeNotation(once)
    expect(once).toBe(twice)
  })

  it('transpozycja po normalizacji: h fis -2 = Bm F#m -2 = Am Em', () => {
    const normalized = normalizeNotation('h  fis')
    const transposed = transposeContent(normalized, -2)
    expect(transposed).toBe('Am  Em')
  })

  it('pełny przykład z piosenki', () => {
    const input = 'D           A\nZapiszę śniegiem\nh            fis\nzaplotę z dymu'
    const expected = 'D           A\nZapiszę śniegiem\nBm            F#m\nzaplotę z dymu'
    expect(normalizeNotation(input)).toBe(expected)
  })
})

describe('parseSongContent', () => {
  it('parses chord-lyric pairs', () => {
    const content = 'C     G\nOver the mountains\n\nAm    F\nand far away'
    const lines = parseSongContent(content)
    expect(lines[0]).toEqual({ type: 'chord-lyric', chords: ['C', 'G'], text: 'Over the mountains' })
    expect(lines[1]).toEqual({ type: 'empty' })
    expect(lines[2]).toEqual({ type: 'chord-lyric', chords: ['Am', 'F'], text: 'and far away' })
  })

  it('parses section labels', () => {
    const content = '[Verse 1]\nC  G\nSome lyrics'
    const lines = parseSongContent(content)
    expect(lines[0]).toEqual({ type: 'section', label: 'Verse 1' })
  })
})
