'use client'
// src/components/ui/ScrollReveal.tsx

import { useEffect, useRef, ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  delay?: number         // ms
  direction?: 'up' | 'left' | 'right' | 'none'
  distance?: number      // px
  className?: string
  style?: CSSProperties
  threshold?: number
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 28,
  className = '',
  style = {},
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const translateInit =
      direction === 'up'    ? `translateY(${distance}px)` :
      direction === 'left'  ? `translateX(-${distance}px)` :
      direction === 'right' ? `translateX(${distance}px)` : 'none'

    // Initial hidden state
    el.style.opacity = '0'
    el.style.transform = translateInit
    el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'none'
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, direction, distance, threshold])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
