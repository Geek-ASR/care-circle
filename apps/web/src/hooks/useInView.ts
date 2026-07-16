import { useEffect, useRef } from 'react'

/** Calls `onInView` whenever the returned ref's element becomes visible. Used to trigger infinite-scroll fetches. */
export function useInView<T extends HTMLElement>(onInView: () => void, enabled = true) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!enabled) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onInView()
      },
      { rootMargin: '400px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [onInView, enabled])

  return ref
}
