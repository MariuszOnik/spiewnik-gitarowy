export type Genre = 'folk' | 'rock' | 'pop' | 'country' | 'blues' | 'jazz' | 'classical' | 'other'
export type Language = 'pl' | 'en' | 'de' | 'fr' | 'es' | 'other'
export type NoteNames = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export interface Song {
  id: string
  title: string
  artist: string
  author?: string
  genre?: Genre
  language?: Language
  originalKey?: NoteNames
  currentKey?: NoteNames
  capo: number
  bpm?: number
  tags: string[]
  content: string
  isFavorite: boolean
  scrollSpeed: number
  fontSize: number
  chordOffset?: number   // przesunięcie poziome akordów w px (dla tej piosenki)
  createdAt: number
  updatedAt: number
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  defaultFontSize: number
  defaultScrollSpeed: number
  chordNotation: 'english' | 'european'  // english: C# B, european: Cis H
  chordColor: string    // hex, domyślnie #f59e0b (amber-500)
  lyricsColor: string  // hex, '' = auto (z motywu)
  bgColor: string      // hex, '' = auto (z motywu)
}

export type ViewMode = 'list' | 'view' | 'edit' | 'stage'

export interface Setlist {
  id: string
  name: string
  description?: string
  songIds: string[]   // kolejność ma znaczenie
  createdAt: number
  updatedAt: number
}
