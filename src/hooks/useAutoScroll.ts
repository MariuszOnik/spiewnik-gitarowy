import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  speed: number        // 1-100
  onStop?: () => void
}

export function useAutoScroll({ speed, onStop }: Options) {
  const [isScrolling, setIsScrolling] = useState(false)
  const rafRef = useRef<number | null>(null)
  const accRef = useRef(0)   // subpixel accumulator

  // px/frame: 1→0.03px (~2px/s), 50→0.27px (~16px/s), 100→0.5px (~30px/s)
  const pxPerFrame = (speed / 100) * 0.47 + 0.03

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
