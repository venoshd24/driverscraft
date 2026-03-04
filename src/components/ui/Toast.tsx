'use client'
// src/components/ui/Toast.tsx

import { useEffect, useState } from 'react'

let _showToast: (msg: string) => void = () => {}

export function showToast(msg: string) { _showToast(msg) }

export default function Toast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])

  useEffect(() => {
    let counter = 0
    _showToast = (msg: string) => {
      const id = counter++
      setToasts(prev => [...prev, { id, msg }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  )
}
