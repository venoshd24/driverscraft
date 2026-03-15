'use client'
import { useEffect, useRef } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    // Clear old localStorage key for testing — remove this line after confirming it works
    const today = new Date().toISOString().slice(0, 10)
    const key = `view:${slug}:${today}`
    localStorage.removeItem(key) // TEMP: always count so we can test

    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then(r => r.json())
      .then(data => console.log('[ViewTracker] response:', data))
      .catch(err => {
        console.error('[ViewTracker] fetch error:', err)
        localStorage.removeItem(key)
      })
  }, [slug])

  return null
}
