'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/ui/Toast'

type E = { firstName?: string; email?: string; password?: string; confirm?: string }

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<E>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [strength, setStrength] = useState(0)

  function getStrength(p: string) {
    let s = 0
    if (p.length >= 6) s++; if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  function validate() {
    const e: E = {}
    if (!firstName.trim()) e.firstName = 'First name required'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password || password.length < 6) e.password = 'At least 6 characters'
    if (password && confirm && password !== confirm) e.confirm = 'Passwords do not match'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault(); setServerError('')
    if (!validate()) return
    setLoading(true)
    const { error: err } = await createClient().auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName } } })
    setLoading(false)
    if (err) { setServerError(err.message); return }
    showToast('🎉 Welcome to driversCraft!'); router.push('/'); router.refresh()
  }

  const strengthColors = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#27ae60']
  const strengthLabels = ['','Weak','Fair','Good','Strong','Very Strong']
  const page = { minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f0', padding: '2rem' }
  const card = { background: '#fff', borderRadius: 16, padding: 'clamp(1.75rem,5vw,2.5rem)', width: '100%', maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)' }

  return (
    <div style={page as any}>
      <div style={card as any}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-deep)' }}>drivers<span style={{ color: 'var(--accent)' }}>Craft</span>.</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Create your free account</p>
        </div>

        {serverError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.84rem', marginBottom: '1.25rem' }}>{serverError}</div>}

        <form onSubmit={handleSignup} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: errors.firstName ? '0.25rem' : '1.25rem' }}>
            <div>
              <label className="form-label">First Name *</label>
              <input className="form-input" style={errors.firstName ? { borderColor: '#c0392b' } : {}} value={firstName} onChange={e => { setFirstName(e.target.value); if (errors.firstName) setErrors(p => ({ ...p, firstName: undefined })) }} placeholder="Lewis" />
              {errors.firstName && <div className="form-error">{errors.firstName}</div>}
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Hamilton" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" style={errors.email ? { borderColor: '#c0392b' } : {}} type="email" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }} placeholder="you@example.com" />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" style={errors.password ? { borderColor: '#c0392b' } : {}} type="password" value={password} onChange={e => { setPassword(e.target.value); setStrength(getStrength(e.target.value)); if (errors.password) setErrors(p => ({ ...p, password: undefined })) }} placeholder="Min. 6 characters" />
            {errors.password && <div className="form-error">{errors.password}</div>}
            {password.length > 0 && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength-1] : '#e5e7eb', transition: 'background 0.2s' }} />)}
                </div>
                <div style={{ fontSize: '0.7rem', color: strength > 0 ? strengthColors[strength-1] : 'var(--text-muted)', marginTop: '0.2rem' }}>{strengthLabels[strength]}</div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input className="form-input" style={errors.confirm ? { borderColor: '#c0392b' } : {}} type="password" value={confirm} onChange={e => { setConfirm(e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined })) }} placeholder="Repeat password" />
            {errors.confirm && <div className="form-error">{errors.confirm}</div>}
          </div>

          <button type="submit" className="btn btn-green btn-full" disabled={loading} style={{ padding: '0.85rem', fontSize: '0.9rem', borderRadius: 8 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'var(--green-brand)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  )
}
