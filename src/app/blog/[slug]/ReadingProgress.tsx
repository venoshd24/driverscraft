'use client'
// src/app/blog/[slug]/ReadingProgress.tsx

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ReadingProgress({ content, title, tag }: {
  content: string
  title: string
  tag: string
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const [mounted, setMounted] = useState(false)

  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  const readMins = Math.max(1, Math.round(wordCount / 200))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const bar = barRef.current
    if (!bar) return

    const hero = document.querySelector('[data-article-hero]')
    if (hero) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Hero visible — hide bar and disable pointer events
            bar.style.transform = 'translateY(-110%)'
            bar.style.opacity = '0'
            bar.style.pointerEvents = 'none'
          } else {
            // Hero gone — show bar and enable pointer events
            bar.style.transform = 'translateY(0)'
            bar.style.opacity = '1'
            bar.style.pointerEvents = 'auto'
          }
        },
        { threshold: 0 }
      )
      observer.observe(hero)

      function updateProgress() {
        const scrollY = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const p = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0
        // Re-query refs each time in case portal re-rendered
        const line = lineRef.current
        const pct = pctRef.current
        if (line) line.style.width = `${p}%`
        if (pct) pct.textContent = `${Math.round(p)}%`
      }

      window.addEventListener('scroll', updateProgress, { passive: true })
      // Run after a short delay to ensure portal is painted
      const t = setTimeout(updateProgress, 100)

      return () => {
        observer.disconnect()
        window.removeEventListener('scroll', updateProgress)
        clearTimeout(t)
      }
    }
  }, [mounted])

  const bar = (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: 'translateY(-110%)',
        opacity: 0,
        pointerEvents: 'none',
        transition: 'transform 0.25s ease, opacity 0.2s ease',
      }}
    >
      <div style={{
        background: '#0a1510',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
        padding: '0 clamp(1rem,4vw,2.5rem)',
        height: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <a href="/blog" style={{ color: 'rgba(240,245,236,0.5)', textDecoration: 'none', fontSize: '1.1rem', flexShrink: 0 }}>←</a>
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
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'rgba(240,245,236,0.45)', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <span ref={pctRef} style={{ color: '#c8a84b', fontWeight: 700 }}>0%</span>
          {' · '}{readMins} min
        </span>
      </div>
      {/* Progress line flush at the bottom of the bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div ref={lineRef} style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg, #0e6640, #c8a84b)' }} />
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(bar, document.body)
}
