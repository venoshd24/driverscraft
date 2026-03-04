'use client'
// src/components/ui/RouteProgressBar.tsx

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RouteProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname

    // Start
    setVisible(true)
    setProgress(0)

    // Animate to 85% quickly
    const t1 = setTimeout(() => setProgress(30), 50)
    const t2 = setTimeout(() => setProgress(65), 200)
    const t3 = setTimeout(() => setProgress(85), 400)

    // Complete
    const t4 = setTimeout(() => setProgress(100), 550)
    const t5 = setTimeout(() => setVisible(false), 850)

    timerRef.current = t5
    return () => { [t1,t2,t3,t4,t5].forEach(clearTimeout) }
  }, [pathname])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, zIndex: 9999,
      height: 2, width: `${progress}%`,
      background: 'linear-gradient(90deg, var(--accent), var(--green-light))',
      transition: progress === 100 ? 'width 0.15s ease, opacity 0.3s ease' : 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
      opacity: progress === 100 ? 0 : 1,
      borderRadius: '0 2px 2px 0',
      boxShadow: '0 0 8px rgba(200,168,75,0.6)',
    }} />
  )
}
