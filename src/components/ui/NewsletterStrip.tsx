'use client'
// src/components/ui/NewsletterStrip.tsx

import { useState } from 'react'
import { showToast } from './Toast'

export default function NewsletterStrip() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function subscribe() {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('⚠️ Please enter a valid email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setDone(true)
        setEmail('')
        showToast('🏁 You\'re subscribed! Welcome to the grid.')
      } else {
        showToast('❌ Something went wrong. Try again.')
      }
    } catch {
      showToast('❌ Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="newsletter-strip">
      <div>
        <div className="font-mono" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>
          Stay in the Loop
        </div>
        <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: 'var(--cream)' }}>
          Race day updates,<br />straight to your inbox.
        </h3>
      </div>
      <div className="newsletter-form">
        {done ? (
          <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1rem', padding: '0.75rem 0' }}>
            ✓ You're on the list. Welcome to the grid.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="email" placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && subscribe()}
              className="newsletter-input"
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={subscribe} disabled={loading}>
              {loading ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
        )}
        <p style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.75rem', marginTop: 8 }}>No spam. Unsubscribe any time.</p>
      </div>
    </div>
  )
}
