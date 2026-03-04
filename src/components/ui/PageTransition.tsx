'use client'
// src/components/ui/PageTransition.tsx

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reset and replay animation on route change
    el.style.animation = 'none'
    el.offsetHeight // force reflow
    el.style.animation = ''
  }, [pathname])

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  )
}
