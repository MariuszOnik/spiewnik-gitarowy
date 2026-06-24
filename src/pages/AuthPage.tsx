import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Guitar, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSongsStore } from '@/store/songsStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const signIn = useAuthStore(s => s.signIn)
  const signUp = useAuthStore(s => s.signUp)
  const syncAfterLogin = useSongsStore(s => s.syncAfterLogin)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (tab === 'register' && password !== password2) {
      setError('Hasła nie są identyczne')
      return
    }
    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }
    if (tab === 'register' && !username.trim()) {
      setError('Wpisz nazwę użytkownika')
      return
    }

    setLoading(true)

    if (tab === 'login') {
      const err = await signIn(email, password)
      if (err) { setError(err); setLoading(false); return }
      await syncAfterLogin()
      navigate('/')
    } else {
      const err = await signUp(email, password, username)
      if (err) { setError(err); setLoading(false); return }
      setInfo('Sprawdź email i kliknij link aktywacyjny, potem wróć i zaloguj się.')
      setTab('login')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-3">
            <Guitar size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Śpiewnik Gitarowy</h1>
          <p className="text-sm text-gray-500 mt-1">Zaloguj się, żeby dodawać piosenki</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setInfo(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {tab === 'register' && (
            <input
              type="text"
              placeholder="Nazwa użytkownika (widoczna przy piosenkach)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          )}
          <input
            type="password"
            placeholder="Hasło (min. 6 znaków)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {tab === 'register' && (
            <input
              type="password"
              placeholder="Powtórz hasło"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}
          {info && (
            <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {tab === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mx-auto"
        >
          <ArrowLeft size={15} />
          Wróć bez logowania
        </button>
      </div>
    </div>
  )
}
