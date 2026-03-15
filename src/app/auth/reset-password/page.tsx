'use client'
// src/app/auth/reset-password/page.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const sb = createClient()
    const { error: err } = await sb.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    showToast('✅ Password updated!')
    router.push('/')
  }

  const inputBase = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 7,
    border: '1.5px solid var(--border)', background: '#fff',
    color: 'var(--text-dark)', fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(14,102,64,0.1)' }}>
        <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: '0.3rem' }}>
          drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>Set your new password.</p>

        {error && (
          <div style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 7, padding: '0.75rem 1rem', color: '#c0392b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{error}</div>
        )}

        <form onSubmit={handleReset}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">New Password</label>
            <input style={inputBase} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Confirm Password</label>
            <input style={inputBase} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" required />
          </div>
          <button type="submit" className="btn btn-green btn-full btn-lg" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
