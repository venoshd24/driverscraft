'use client'
// src/components/ui/ShareButtons.tsx

import { useState } from 'react'
import { showToast } from './Toast'

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)

  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      showToast('🔗 Link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shares = [
    {
      label: 'X',
      icon: '𝕏',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      bg: '#000',
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encoded}`,
      bg: '#25D366',
    },
    {
      label: 'Facebook',
      icon: 'f',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      bg: '#1877f2',
    },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>Share</span>
      {shares.map(s => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${s.label}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 8,
            background: s.bg, color: '#fff',
            fontSize: s.label === 'X' ? '0.85rem' : '0.9rem',
            fontWeight: 800, textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.8'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          {s.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        title="Copy link"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: 8,
          background: copied ? 'var(--green-brand)' : 'var(--cream-dark)',
          color: copied ? '#fff' : 'var(--text-dark)',
          border: 'none', cursor: 'pointer', fontSize: '0.85rem',
          transition: 'all 0.15s',
        }}
      >
        {copied ? '✓' : '🔗'}
      </button>
    </div>
  )
}
