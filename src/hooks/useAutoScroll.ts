import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  speed: number        // 1-100
  onStop?: () => void
}

export function useAutoScroll({ speed, onStop }: Options) {
  const [isScrolling, setIsScrolling] = useState(false)
  const rafRef = useRef<number | null>(null)
  const accRef = useRef(0)   // subpixel accumulator

  // px/frame = speed skalowane: 1→0.2px, 100→4px
  const pxPerFrame = (speed / 100) * 3.8 + 0.2

  const stop = useCallback(() => {
    setIsScrolling(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    onStop?.()
  }, [onStop])

  const start = useCallback(() => {
    setIsScrolling(true)
  }, [])

  const toggle = useCallback(() => {
    setIsScrolling(v => !v)
  }, [])

  useEffect(() => {
    if (!isScrolling) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const scroll = () => {
      accRef.current += pxPerFrame
      const px = Math.floor(accRef.current)
      if (px >= 1) {
        window.scrollBy(0, px)
        accRef.current -= px
      }

      // Zatrzymaj na dole strony
      const atBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 2
      if (atBottom) {
        stop()
        return
      }

      rafRef.current = requestAnimationFrame(scroll)
    }

    rafRef.current = requestAnimationFrame(scroll)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isScrolling, pxPerFrame, stop])

  return { isScrolling, start, stop, toggle }
}
