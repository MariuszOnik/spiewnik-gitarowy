export function makeSongKey(title: string, artist: string): string {
  const n = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  return `${n(title)}::${n(artist)}`
}
