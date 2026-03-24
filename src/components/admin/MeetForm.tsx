'use client'
// src/components/admin/MeetForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import ImageUpload from './ImageUpload'

export default function MeetForm({ meet }: { meet?: any }) {
  const router = useRouter()
  const isEdit = !!meet

  const [form, setForm] = useState({
    title: meet?.title || '',
    date: meet?.date || '',
    location: meet?.location || '',
    description: meet?.description || '',
    poster_url: meet?.poster_url || '',
  })
  const [saving, setSaving] = useState(false)

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.date || !form.location) {
      showToast('⚠️ Title, date and location are required')
      return
    }
    setSaving(true)
    const sb = createClient()
    const payload = {
      title: form.title,
      date: form.date,
      location: form.location,
      description: form.description || null,
      poster_url: form.poster_url || null,
    }

    const { error } = isEdit
      ? await sb.from('car_meets').update(payload).eq('id', meet.id)
      : await sb.from('car_meets').insert(payload)

    setSaving(false)
    if (error) { showToast('❌ ' + error.message); return }
    showToast(isEdit ? '✅ Meet updated!' : '✅ Meet created!')
    router.push('/admin/meets')
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)', background: '#0f1a14',
    color: '#f0f5ec', fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem',
    outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono, monospace',
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    color: 'rgba(240,245,236,0.5)', marginBottom: '0.5rem',
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Poster upload */}
        <ImageUpload
          bucket="product-images"
          currentUrl={form.poster_url || null}
          onUpload={url => set('poster_url', url)}
          label="Meet Poster"
        />

        <div>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Shah Alam Midnight Run" required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Location *</label>
            <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Dataran Shah Alam" required />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical' } as any}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What's going down, what to bring, dress code, etc."
          />
        </div>

        <div style={{ display: 'flex', gap: 12, paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button type="submit" disabled={saving} style={{
            background: '#0e6640', color: '#f0f5ec', border: 'none', borderRadius: 6,
            padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.88rem',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {saving ? 'Saving…' : isEdit ? 'Update Meet' : 'Create Meet'}
          </button>
          <button type="button" onClick={() => router.push('/admin/meets')} style={{
            background: 'transparent', color: 'rgba(240,245,236,0.5)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
            padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.88rem',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>Cancel</button>
        </div>
      </div>
    </form>
  )
}
