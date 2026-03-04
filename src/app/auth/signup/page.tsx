'use client'
// src/app/auth/signup/page.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/ui/Toast'

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const sb = createClient()
    const { error: err } = await sb.auth.signUp({
      email, password,
      options: { data: { first_name: firstName, last_name: lastName } },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    showToast('🎉 Account created! Welcome to driversCraft.')
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '2rem' }}>
      <div style={{ background: 'var(--white)', borderRadius: 12, padding: '3rem', width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(14,102,64,0.1)' }}>
        <div className="font-serif" style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: '0.3rem' }}>
          drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Join the community. Create your free account.</p>

        {error && (
          <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 5, padding: '0.8rem 1rem', color: 'var(--red)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Lewis" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Hamilton" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-green btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'var(--green-brand)', fontWeight: 600 }}>Log in →</Link>
        </div>
      </div>
    </div>
  )
}
