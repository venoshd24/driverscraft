'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/ui/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{email?: string; password?: string}>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  function validate() {
    const e: {email?: string; password?: string} = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'At least 6 characters'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setServerError('')
    if (!validate()) return
    setLoading(true)
    const { error: err } = await createClient().auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setServerError('Invalid email or password'); return }
    showToast('✅ Welcome back!')
    router.push(redirect); router.refresh()
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { showToast('⚠️ Enter a valid email'); return }
    setForgotLoading(true)
    await createClient().auth.resetPasswordForEmail(forgotEmail, { redirectTo: `${window.location.origin}/auth/reset-password` })
    setForgotLoading(false); setForgotSent(true)
  }

  const card = { background: '#fff', borderRadius: 16, padding: 'clamp(1.75rem,5vw,2.5rem)', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }
  const page = { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f0', padding: '2rem' }

  if (forgotMode) return (
    <div style={page as any}>
      <div style={card as any}>
        <button onClick={() => { setForgotMode(false); setForgotSent(false) }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', padding: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 4 }}>← Back to Login</button>
        <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: '0.35rem' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>We'll send a reset link to your inbox.</p>
        {forgotSent ? (
          <div style={{ background: 'rgba(14,102,64,0.07)', border: '1px solid rgba(14,102,64,0.2)', borderRadius: 8, padding: '1rem', color: 'var(--green-brand)', fontSize: '0.88rem' }}>
            ✅ Check your inbox — we sent a link to <strong>{forgotEmail}</strong>
          </div>
        ) : (
          <form onSubmit={handleForgot}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <button type="submit" className="btn btn-green btn-full" disabled={forgotLoading} style={{ padding: '0.85rem', fontSize: '0.9rem', borderRadius: 8 }}>
              {forgotLoading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )

  return (
    <div style={page as any}>
      <div style={card as any}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-deep)' }}>drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Welcome back</p>
        </div>

        {serverError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.84rem', marginBottom: '1.25rem' }}>{serverError}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" style={errors.email ? { borderColor: '#c0392b' } : {}} type="email" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }} placeholder="you@example.com" />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button type="button" onClick={() => setForgotMode(true)} style={{ background: 'none', border: 'none', color: 'var(--green-brand)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Forgot password?</button>
            </div>
            <input className="form-input" style={errors.password ? { borderColor: '#c0392b' } : {}} type="password" value={password} onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })) }} placeholder="••••••••" />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <button type="submit" className="btn btn-green btn-full" disabled={loading} style={{ padding: '0.85rem', fontSize: '0.9rem', borderRadius: 8, marginTop: '0.25rem' }}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          No account? <Link href="/auth/signup" style={{ color: 'var(--green-brand)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() { return <Suspense><LoginForm /></Suspense> }
