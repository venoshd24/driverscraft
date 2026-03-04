'use client'
// src/components/ui/NewsletterStrip.tsx

import { useState } from 'react'
import { showToast } from './Toast'

export default function NewsletterStrip() {
  const [email, setEmail] = useState('')

  function subscribe() {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { showToast('⚠️ Please enter a valid email'); return }
    setEmail('')
    showToast('🏁 You\'re subscribed! Welcome to the grid.')
  }

  return (
    <div style={{
      background: 'var(--green-deep)', padding: '4rem 5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '2rem', flexWrap: 'wrap',
    }}>
      <div>
        <div className="font-mono" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>
          Stay in the Loop
        </div>
        <h3 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)' }}>
          Race day updates,<br />straight to your inbox.
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="email" placeholder="your@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && subscribe()}
            style={{
              padding: '0.7rem 1.2rem', borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
              color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
              width: 280, outline: 'none',
            }}
          />
          <button className="btn btn-primary" onClick={subscribe}>Subscribe</button>
        </div>
        <p style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.75rem' }}>No spam. Unsubscribe any time.</p>
      </div>
    </div>
  )
}
