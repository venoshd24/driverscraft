'use client'
// src/app/auth/signup/page.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/ui/Toast'

type Errors = { firstName?: string; email?: string; password?: string; confirm?: string }

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [errors, setErrors]       = useState<Errors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]     = useState(false)
  const [strength, setStrength]   = useState(0)

  function getStrength(p: string) {
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  function handlePasswordChange(val: string) {
    setPassword(val)
    setStrength(getStrength(val))
    if (errors.password) setErrors(p => ({ ...p, password: undefined }))
  }

  function validate() {
    const e: Errors = {}
    if (!firstName.trim()) e.firstName = 'First name is required'
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    if (password && confirm && password !== confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    const sb = createClient()
    const { error: err } = await sb.auth.signUp({
      email, password,
      options: { data: { first_name: firstName, last_name: lastName } },
    })
    setLoading(false)
    if (err) { setServerError(err.message); return }
    showToast('🎉 Account created! Welcome to driversCraft.')
    router.push('/')
    router.refresh()
  }

  const inputBase = (hasError?: boolean) => ({
    width: '100%', padding: '0.75rem 1rem', borderRadius: 7,
    border: `1.5px solid ${hasError ? '#c0392b' : 'var(--border)'}`,
    background: '#fff', color: 'var(--text-dark)',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
    outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  })

  const strengthColors = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#27ae60']
  const strengthLabels = ['','Weak','Fair','Good','Strong','Very Strong']

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(14,102,64,0.1)' }}>
        <div className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: '0.3rem' }}>
          drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>Join the community. Create your free account.</p>

        {serverError && (
          <div style={{ background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 7, padding: '0.75rem 1rem', color: '#c0392b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSignup} noValidate>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: errors.firstName ? '0.25rem' : '1rem' }}>
            <div>
              <label className="form-label">First Name *</label>
              <input style={inputBase(!!errors.firstName)} value={firstName}
                onChange={e => { setFirstName(e.target.value); if (errors.firstName) setErrors(p => ({ ...p, firstName: undefined })) }}
                placeholder="Lewis" />
              {errors.firstName && <div style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.2rem' }}>{errors.firstName}</div>}
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input style={inputBase()} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Hamilton" />
            </div>
          </div>

          <div style={{ marginBottom: errors.email ? '0.25rem' : '1rem' }}>
            <label className="form-label">Email *</label>
            <input style={inputBase(!!errors.email)} type="email" value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
              placeholder="you@example.com" />
            {errors.email && <div style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.2rem' }}>{errors.email}</div>}
          </div>

          <div style={{ marginBottom: errors.password ? '0.25rem' : '1rem' }}>
            <label className="form-label">Password *</label>
            <input style={inputBase(!!errors.password)} type="password" value={password}
              onChange={e => handlePasswordChange(e.target.value)}
              placeholder="Min. 6 characters" />
            {errors.password && <div style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.2rem' }}>{errors.password}</div>}
            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength - 1] : 'var(--border)', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <div style={{ fontSize: '0.7rem', color: strength > 0 ? strengthColors[strength - 1] : 'var(--text-muted)', marginTop: '0.2rem' }}>{strengthLabels[strength]}</div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Confirm Password *</label>
            <input style={inputBase(!!errors.confirm)} type="password" value={confirm}
              onChange={e => { setConfirm(e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined })) }}
              placeholder="Repeat your password" />
            {errors.confirm && <div style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.2rem' }}>{errors.confirm}</div>}
          </div>

          <button type="submit" className="btn btn-green btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--green-brand)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </div>
  )
}
