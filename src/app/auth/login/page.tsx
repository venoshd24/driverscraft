'use client'
// src/app/auth/login/page.tsx

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/ui/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState<{email?: string; password?: string}>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  function validate() {
    const e: {email?: string; password?: string} = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    const sb = createClient()
    const { error: err } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setServerError(err.message); return }
    showToast('✅ Welcome back!')
    router.push(redirect)
    router.refresh()
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      showToast('⚠️ Enter a valid email')
      return
    }
    setForgotLoading(true)
    const sb = createClient()
    await sb.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setForgotLoading(false)
    setForgotSent(true)
  }

  const inputBase = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 7,
    border: '1.5px solid var(--border)', background: '#fff',
    color: 'var(--text-dark)', fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  }

  if (forgotMode) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(14,102,64,0.1)' }}>
        <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: '0.3rem' }}>
          drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
        </div>
        {forgotSent ? (
          <>
            <div style={{ background: 'rgba(14,102,64,0.08)', border: '1px solid rgba(14,102,64,0.2)', borderRadius: 7, padding: '1rem', color: 'var(--green-brand)', fontSize: '0.88rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              ✅ Check your inbox — we sent a reset link to <strong>{forgotEmail}</strong>
            </div>
            <button onClick={() => { setForgotMode(false); setForgotSent(false) }} style={{ ...inputBase, background: 'var(--green-brand)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Back to Login
            </button>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.75rem 0 1.5rem' }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input style={inputBase} type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <button type="submit" disabled={forgotLoading} style={{ ...inputBase, background: 'var(--green-brand)', color: '#fff', border: 'none', fontWeight: 700, cursor: forgotLoading ? 'not-allowed' : 'pointer', opacity: forgotLoading ? 0.7 : 1, marginTop: '0.5rem' }}>
                {forgotLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <button onClick={() => setForgotMode(false)} style={{ display: 'block', width: '100%', marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}>← Back to Login</button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(14,102,64,0.1)' }}>
        <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: '0.3rem' }}>
          drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>Welcome back. Log in to your account.</p>

        {serverError && (
          <div style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 7, padding: '0.75rem 1rem', color: '#c0392b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group" style={{ marginBottom: errors.email ? '0.25rem' : '1rem' }}>
            <label className="form-label">Email</label>
            <input
              style={{ ...inputBase, borderColor: errors.email ? '#c0392b' : undefined }}
              type="email" value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
              placeholder="you@example.com"
            />
            {errors.email && <div style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</div>}
          </div>

          <div className="form-group" style={{ marginBottom: errors.password ? '0.25rem' : '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button type="button" onClick={() => setForgotMode(true)} style={{ background: 'none', border: 'none', color: 'var(--green-brand)', fontSize: '0.78rem', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                Forgot password?
              </button>
            </div>
            <input
              style={{ ...inputBase, borderColor: errors.password ? '#c0392b' : undefined }}
              type="password" value={password}
              onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })) }}
              placeholder="••••••••"
            />
            {errors.password && <div style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-green btn-full btn-lg" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--green-brand)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
