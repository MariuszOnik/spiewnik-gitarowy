import { Music2 } from 'lucide-react'

export default function SongListPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <Music2 size={64} className="text-amber-500" />
      <h1 className="text-3xl font-bold">Śpiewnik Gitarowy</h1>
      <p className="text-gray-500 dark:text-gray-400">Ładowanie listy piosenek...</p>
    </div>
  )
}
