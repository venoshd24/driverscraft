'use client'
// src/components/ui/PageTransition.tsx

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const isFirst = useRef(true)

  useEffect(() => {
    // Skip on first mount (page load/refresh) — no animation
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    const el = ref.current
    if (!el) return

    // Fade out instantly, then fade back in
    el.style.transition = 'none'
    el.style.opacity = '0'
    el.style.transform = 'translateY(6px)'

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.2s ease, transform 0.2s ease'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
    })
  }, [pathname])

  return (
    <div ref={ref} style={{ opacity: 1 }}>
      {children}
    </div>
  )
}
