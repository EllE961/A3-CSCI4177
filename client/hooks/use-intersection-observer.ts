"use client"

import { useEffect, useRef } from "react"

interface UseIntersectionObserverProps {
  onIntersect: () => void
  threshold?: number
  rootMargin?: string
}

export function useIntersectionObserver({
  onIntersect,
  threshold = 0.1,
  rootMargin = "0px",
}: UseIntersectionObserverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [onIntersect, threshold, rootMargin])

  return { ref }
}
