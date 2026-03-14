'use client'
// src/app/blog/[slug]/ReadingProgress.tsx

import { useEffect, useState } from 'react'

export default function ReadingProgress({ content, title, tag }: {
  content: string
  title: string
  tag: string
}) {
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    function update() {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0)
      setShow(scrollY > 200)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  const readMins = Math.max(1, Math.round(wordCount / 200))

  if (!show) return null

  return (
    // position right below the navbar — navbar is fixed at top:0, height:64px
    // we use top: var(--nav-height) so this sits flush underneath it
    <div style={{
      position: 'fixed',
      top: 'var(--nav-height)',
      left: 0,
      right: 0,
      zIndex: 1001,
    }}>
      {/* Progress line */}
      <div style={{ height: 3, background: 'rgba(0,0,0,0.12)' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #0e6640, #c8a84b)',
          transition: 'width 0.1s linear',
        }} />
      </div>

      {/* Bar */}
      <div style={{
        background: '#0a1510',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
        padding: '0 clamp(1rem,4vw,2.5rem)',
        height: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <a href="/blog" style={{
          color: 'rgba(240,245,236,0.5)', textDecoration: 'none',
          fontSize: '1.1rem', flexShrink: 0,
        }}>←</a>

        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        <span style={{
          fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#c8a84b',
          background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.25)',
          padding: '3px 8px', borderRadius: 2, flexShrink: 0,
        }}>{tag}</span>

        <span style={{
          fontSize: '0.85rem', fontWeight: 600, color: '#f0f5ec',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          flex: 1, minWidth: 0, fontFamily: 'DM Sans, sans-serif',
        }}>{title}</span>

        <span style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
          color: '#c8a84b', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
        }}>{Math.round(progress)}% · {readMins} min</span>
      </div>
    </div>
  )
}