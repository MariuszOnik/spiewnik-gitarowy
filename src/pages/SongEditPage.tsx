import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Info } from 'lucide-react'
import { useSongsStore } from '@/store/songsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { normalizeNotation } from '@/utils/chords'
import SongRenderer from '@/components/SongRenderer'
import type { Genre, Language, NoteNames } from '@/types'

const NOTES: NoteNames[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const GENRES: { value: Genre; label: string }[] = [
  { value: 'folk', label: 'Folk' }, { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' }, { value: 'country', label: 'Country' },
  { value: 'blues', label: 'Blues' }, { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Klasyczna' }, { value: 'other', label: 'Inne' },
]
const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'pl', label: 'Polski' }, { value: 'en', label: 'Angielski' },
  { value: 'de', label: 'Niemiecki' }, { value: 'fr', label: 'Francuski' },
  { value: 'es', label: 'Hiszpański' }, { value: 'other', label: 'Inne' },
]

const EXAMPLE_CONTENT = `[Zwrotka 1]
C     G     Am    F
Wpisz tutaj słowa piosenki
C          G
A tutaj kolejny wers

[Refren]
F       C
Akordy nad każdą linią
G              Am
Tak wygląda format zapisu`

export default function SongEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const songs = useSongsStore(s => s.songs)
  const addSong = useSongsStore(s => s.addSong)
  const updateSong = useSongsStore(s => s.updateSong)
  const deleteSong = useSongsStore(s => s.deleteSong)
  const { defaultFontSize } = useSettingsStore()

  const isNew = id === undefined || id === 'new'
  const existing = isNew ? undefined : songs.find(s => s.id === id)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [artist, setArtist] = useState(existing?.artist ?? '')
  const [author, setAuthor] = useState(existing?.author ?? '')
  const [genre, setGenre] = useState<Genre | ''>(existing?.genre ?? '')
  const [language, setLanguage] = useState<Language | ''>(existing?.language ?? '')
  const [originalKey, setOriginalKey] = useState<NoteNames | ''>(existing?.originalKey ?? '')
  const [capo, setCapo] = useState(existing?.capo ?? 0)
  const [bpm, setBpm] = useState(existing?.bpm?.toString() ?? '')
  const [tags, setTags] = useState(existing?.tags?.join(', ') ?? '')
  const [content, setContent] = useState(existing?.content ?? EXAMPLE_CONTENT)
  const [showPreview, setShowPreview] = useState(false)
  const [showMeta, setShowMeta] = useState(true)
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ładuj dane istniejącej piosenki gdy songs się załadują
  useEffect(() => {
    if (existing && !isNew) {
      setTitle(existing.title)
      setArtist(existing.artist)
      setAuthor(existing.author ?? '')
      setGenre(existing.genre ?? '')
      setLanguage(existing.language ?? '')
      setOriginalKey(existing.originalKey ?? '')
      setCapo(existing.capo)
      setBpm(existing.bpm?.toString() ?? '')
      setTags(existing.tags.join(', '))
      setContent(existing.content)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id])

  const buildPayload = useCallback(() => ({
    title: title.trim() || 'Bez tytułu',
    artist: artist.trim() || 'Nieznany',
    author: author.trim() || undefined,
    genre: genre || undefined,
    language: language || undefined,
    originalKey: (originalKey || undefined) as NoteNames | undefined,
    currentKey: (originalKey || undefined) as NoteNames | undefined,
    capo,
    bpm: bpm ? parseInt(bpm) : undefined,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    content: normalizeNotation(content),
    isFavorite: existing?.isFavorite ?? false,
    scrollSpeed: existing?.scrollSpeed ?? 50,
    fontSize: existing?.fontSize ?? defaultFontSize,
  }), [title, artist, author, genre, language, originalKey, capo, bpm, tags, content, existing, defaultFontSize])

  const handleSave = useCallback(async () => {
    const payload = buildPayload()
    if (isNew) {
      const newId = await addSong(payload)
      setSaved(true)
      setTimeout(() => navigate(`/song/${newId}`), 600)
    } else if (id) {
      await updateSong(id, payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }, [isNew, id, buildPayload, addSong, updateSong, navigate])

  // Auto-save co 3s gdy edytujesz istniejącą
  useEffect(() => {
    if (isNew) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      if (id) updateSong(id, buildPayload())
    }, 3000)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [content, title, artist, isNew, id, buildPayload, updateSong])

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    if (id) { await deleteSong(id); navigate('/') }
  }

  const handleContentChange = (val: string) => {
    setContent(val)
    setSaved(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-3 py-2">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button onClick={() => navigate(isNew ? '/' : `/song/${id}`)} className="p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
              {isNew ? 'Nowa piosenka' : title || 'Edytuj piosenkę'}
            </p>
            {!isNew && (
              <p className="text-[10px] text-gray-400">
                {saved ? '✓ Zapisano' : 'Auto-zapis co 3s'}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowMeta(v => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Metadane"
          >
            <Info size={18} className={showMeta ? 'text-amber-500' : 'text-gray-400'} />
          </button>
          <button
            onClick={() => setShowPreview(v => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Podgląd"
          >
            {showPreview ? <EyeOff size={18} className="text-amber-500" /> : <Eye size={18} className="text-gray-400" />}
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg transition-colors ${confirmDelete ? 'bg-red-100 dark:bg-red-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={confirmDelete ? 'Kliknij ponownie aby usunąć' : 'Usuń piosenkę'}
            >
              <Trash2 size={18} className={confirmDelete ? 'text-red-500' : 'text-gray-400'} />
            </button>
          )}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm transition-colors ${
              saved ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            <Save size={15} />
            {saved ? 'OK!' : 'Zapisz'}
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">

        {/* Metadane */}
        {showMeta && (
          <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Tytuł" required>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Tytuł piosenki"
                  className="input" />
              </Field>
              <Field label="Wykonawca" required>
                <input value={artist} onChange={e => setArtist(e.target.value)}
                  placeholder="Artysta / Zespół"
                  className="input" />
              </Field>
              <Field label="Autor">
                <input value={author} onChange={e => setAuthor(e.target.value)}
                  placeholder="Autor tekstu"
                  className="input" />
              </Field>
              <Field label="Gatunek">
                <select value={genre} onChange={e => setGenre(e.target.value as Genre | '')} className="input">
                  <option value="">– wybierz –</option>
                  {GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>
              <Field label="Język">
                <select value={language} onChange={e => setLanguage(e.target.value as Language | '')} className="input">
                  <option value="">– wybierz –</option>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
              <Field label="Tonacja oryg.">
                <select value={originalKey} onChange={e => setOriginalKey(e.target.value as NoteNames | '')} className="input">
                  <option value="">– wybierz –</option>
                  {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Capo">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCapo(c => Math.max(0, c - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200 dark:hover:bg-gray-700">−</button>
                  <span className="text-sm font-mono font-bold w-4 text-center text-blue-500">{capo}</span>
                  <button onClick={() => setCapo(c => Math.min(11, c + 1))}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold hover:bg-gray-200 dark:hover:bg-gray-700">+</button>
                </div>
              </Field>
              <Field label="BPM">
                <input value={bpm} onChange={e => setBpm(e.target.value.replace(/\D/g, ''))}
                  placeholder="120"
                  className="input" inputMode="numeric" />
              </Field>
              <Field label="Tagi (przecinek)">
                <input value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="folk, ballada, acoustic"
                  className="input" />
              </Field>
            </div>
          </div>
        )}

        {/* Hint o formacie */}
        {isNew && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
            <strong>Format:</strong> akordy na osobnej linii nad tekstem. Sekcje w nawiasach [Verse 1].
            Obsługuje też notację: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">em h as fis</code> → auto-konwersja.
          </div>
        )}

        {/* Edytor + podgląd */}
        <div className={`flex-1 flex ${showPreview ? 'flex-row' : 'flex-col'} overflow-hidden`}>

          {/* Textarea */}
          <div className={`flex flex-col ${showPreview ? 'w-1/2 border-r border-gray-100 dark:border-gray-800' : 'flex-1'}`}>
            {showPreview && (
              <div className="px-4 pt-3 pb-1 text-xs text-gray-400 font-medium">EDYTOR</div>
            )}
            <textarea
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full px-4 py-3 font-mono text-sm bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600"
              style={{ minHeight: showPreview ? '60vh' : 400, lineHeight: 1.7 }}
              placeholder={EXAMPLE_CONTENT}
            />
          </div>

          {/* Podgląd live */}
          {showPreview && (
            <div className="w-1/2 overflow-y-auto">
              <div className="px-4 pt-3 pb-1 text-xs text-gray-400 font-medium">PODGLĄD</div>
              <div className="px-4 pb-8">
                <SongRenderer content={normalizeNotation(content)} fontSize={defaultFontSize} />
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid;
          font-size: 13px;
          outline: none;
          background: transparent;
        }
        .input:focus { border-color: #f59e0b; box-shadow: 0 0 0 2px rgba(245,158,11,0.2); }
        @media (prefers-color-scheme: light) {
          .input { border-color: #e5e7eb; color: #111827; }
        }
        .dark .input { border-color: #374151; color: #f3f4f6; }
      `}</style>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
