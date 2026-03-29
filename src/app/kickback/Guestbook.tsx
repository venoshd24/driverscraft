'use client'
// src/app/kickback/Guestbook.tsx

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'

type Comment = {
  id: string
  message: string
  image_url: string | null
  created_at: string
  user_id: string
  first_name: string | null
  last_name: string | null
  car: string | null
  car_year: string | null
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#0e6640,#1a4a35)',
  'linear-gradient(135deg,#1a4a8a,#0d2d5c)',
  'linear-gradient(135deg,#7a1a1a,#4a0d0d)',
  'linear-gradient(135deg,#4a3a00,#8a6c00)',
  'linear-gradient(135deg,#2a1a4a,#1a0d35)',
]
function avatarGradient(uid: string) {
  let h = 0
  for (let i = 0; i < uid.length; i++) h = uid.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
}

const PREVIEW_COUNT = 3

export default function Guestbook({
  meetId,
  userId,
  isRsvped,
}: {
  meetId: string
  userId: string | null
  isRsvped: boolean
}) {
  const [open, setOpen]             = useState(false)
  const [comments, setComments]     = useState<Comment[]>([])
  const [loading, setLoading]       = useState(false)
  const [showAll, setShowAll]       = useState(false)
  const [message, setMessage]       = useState('')
  const [image, setImage]           = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [lightbox, setLightbox]     = useState<string | null>(null)
  const [newIds, setNewIds]         = useState<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)
  const sb = createClient()

  async function loadComments() {
    const { data: raw, error } = await sb
      .from('meet_comments')
      .select('id, message, image_url, created_at, user_id')
      .eq('meet_id', meetId)
      .order('created_at', { ascending: false })

    if (error || !raw?.length) { setComments([]); setLoading(false); return }

    const ids = raw.map(c => c.user_id).filter((v, i, a) => a.indexOf(v) === i)
    const { data: profiles } = await sb.from('profiles')
      .select('id, first_name, last_name, car, car_year').in('id', ids)

    const pm: Record<string, any> = {}
    for (const p of profiles || []) pm[p.id] = p

    setComments(raw.map(c => ({
      ...c,
      first_name: pm[c.user_id]?.first_name ?? null,
      last_name:  pm[c.user_id]?.last_name  ?? null,
      car:        pm[c.user_id]?.car         ?? null,
      car_year:   pm[c.user_id]?.car_year    ?? null,
    })))
    setLoading(false)
  }

  // Load when first opened
  useEffect(() => {
    if (!open) return
    setLoading(true)
    loadComments()
  }, [open, meetId])

  // Realtime — only when open
  useEffect(() => {
    if (!open) return
    const channel = sb.channel(`gb:${meetId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meet_comments', filter: `meet_id=eq.${meetId}` },
        payload => { setNewIds(prev => { const s = new Set(prev); s.add(payload.new.id); return s }); loadComments() })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'meet_comments', filter: `meet_id=eq.${meetId}` },
        () => loadComments())
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [open, meetId])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('❌ Image must be under 5MB'); return }
    setImage(file); setImagePreview(URL.createObjectURL(file))
  }
  function removeImage() {
    setImage(null); setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit() {
    if (!userId)          { showToast('🔒 Sign in to post'); return }
    if (!isRsvped)        { showToast('🎟 RSVP first!'); return }
    if (!message.trim())  { showToast('✏️ Write something first'); return }
    if (message.length > 300) { showToast('❌ Max 300 characters'); return }
    setSubmitting(true)

    let image_url: string | null = null
    if (image) {
      const ext = image.name.split('.').pop()
      const path = `${userId}/${meetId}-${Date.now()}.${ext}`
      const { error: upErr } = await sb.storage.from('meet-comments').upload(path, image, { upsert: false })
      if (upErr) { showToast('❌ Image upload failed'); setSubmitting(false); return }
      image_url = sb.storage.from('meet-comments').getPublicUrl(path).data.publicUrl
    }

    const { error } = await sb.from('meet_comments').insert({ meet_id: meetId, user_id: userId, message: message.trim(), image_url })
    if (error) showToast('❌ Failed to post — ' + error.message)
    else { showToast('✅ Posted!'); setMessage(''); removeImage(); setShowAll(false); loadComments() }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const { error } = await sb.from('meet_comments').delete().eq('id', id)
    if (error) showToast('❌ Could not delete')
    else { showToast('🗑 Deleted'); loadComments() }
    setDeletingId(null)
  }

  const charCount = message.length
  const overLimit = charCount > 300
  const circumference = 2 * Math.PI * 10
  const dashOffset = circumference * (1 - Math.min(charCount / 300, 1))
  const visible = showAll ? comments : comments.slice(0, PREVIEW_COUNT)
  const hidden  = comments.length - PREVIEW_COUNT

  return (
    <>
      <style>{`
        @keyframes gbIn { from { opacity:0; transform:translateY(10px) scale(0.98) } to { opacity:1; transform:none } }
        .gb-card  { animation: gbIn 0.3s cubic-bezier(0.16,1,0.3,1) both }
        .gb-panel { animation: gbIn 0.25s cubic-bezier(0.16,1,0.3,1) both }
        .gb-del   { opacity:0; transition:opacity 0.15s }
        .gb-card:hover .gb-del { opacity:1 }
        .gb-photo:hover { background:var(--cream-dark) !important }
        @media(max-width:640px){
          .gb-del { opacity:0.5 !important }
          .gb-row { flex-direction:column !important }
          .gb-row > .gb-submit { width:100% !important }
        }
      `}</style>

      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', marginTop: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? 'rgba(14,102,64,0.06)' : '#fff',
          border: `1px solid ${open ? 'rgba(14,102,64,0.2)' : '#e2ead9'}`,
          borderRadius: open ? '12px 12px 0 0' : 12,
          padding: 'clamp(0.75rem,2vw,1rem) clamp(1rem,3vw,1.25rem)',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.1rem' }}>📝</span>
          <span className="font-serif" style={{ fontWeight: 800, fontSize: 'clamp(0.95rem,2vw,1.05rem)', color: 'var(--text-dark)' }}>Guestbook</span>
          {comments.length > 0 && (
            <span style={{ background: 'var(--green-brand)', color: '#fff', borderRadius: 20, padding: '1px 9px', fontSize: '0.7rem', fontWeight: 700 }}>
              {comments.length}
            </span>
          )}
          {!open && !loading && comments.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Be the first to post 🏁</span>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', display: 'block' }}>▼</span>
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="gb-panel" style={{
          background: 'var(--cream)', border: '1px solid rgba(14,102,64,0.15)',
          borderTop: 'none', borderRadius: '0 0 12px 12px',
          padding: 'clamp(1rem,3vw,1.5rem)',
        }}>

          {/* Compose */}
          {userId && isRsvped ? (
            <div style={{ background: '#fff', border: '1.5px solid #e2ead9', borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <textarea
                value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Hype the meet, show your car, drop a shoutout… 🚗💨"
                rows={2}
                style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', padding: '0.85rem 1rem', fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(0.85rem,2vw,0.9rem)', color: 'var(--text-dark)', lineHeight: 1.6, background: 'transparent', boxSizing: 'border-box' }}
              />
              {imagePreview && (
                <div style={{ padding: '0 1rem 0.75rem', position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'cover', display: 'block' }} />
                  <button onClick={removeImage} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              )}
              <div className="gb-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', borderTop: '1px solid #f0f0f0', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button className="gb-photo" onClick={() => fileRef.current?.click()} style={{ background: '#f5f5f5', border: 'none', borderRadius: 7, padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'DM Sans, sans-serif' }}>
                    📷 Photo
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#e2ead9" strokeWidth="2.5" />
                    <circle cx="12" cy="12" r="10" fill="none"
                      stroke={overLimit ? '#e74c3c' : charCount > 240 ? '#f59e0b' : 'var(--green-brand)'}
                      strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                      strokeLinecap="round" transform="rotate(-90 12 12)"
                      style={{ transition: 'stroke-dashoffset 0.2s, stroke 0.2s' }} />
                  </svg>
                  {charCount > 240 && <span style={{ fontSize: '0.68rem', color: overLimit ? '#e74c3c' : 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>{300 - charCount}</span>}
                </div>
                <button className="gb-submit" onClick={handleSubmit} disabled={submitting || !message.trim() || overLimit}
                  style={{ background: 'var(--green-brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: '0.85rem', cursor: submitting || !message.trim() || overLimit ? 'not-allowed' : 'pointer', opacity: submitting || !message.trim() || overLimit ? 0.5 : 1, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                  {submitting ? '…' : 'Post 🏁'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(14,102,64,0.05)', border: '1px dashed rgba(14,102,64,0.2)', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>🎟</span>
              <span>
                {userId
                  ? <><strong style={{ color: 'var(--text-dark)' }}>RSVP</strong> to this meet to post in the guestbook</>
                  : <><Link href="/auth/login?redirect=/kickback" style={{ color: 'var(--green-brand)', fontWeight: 600 }}>Sign in</Link> and RSVP to post</>}
              </span>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />)}
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>🏁</div>
              No posts yet — be the first!
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {visible.map((c, i) => {
                  const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'driversCraft Member'
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  const car = [c.car_year, c.car].filter(Boolean).join(' ')
                  const isOwn = c.user_id === userId
                  const isNew = newIds.has(c.id)

                  return (
                    <div key={c.id} className="gb-card" style={{ animationDelay: `${i * 0.05}s`, background: '#fff', borderRadius: 10, overflow: 'hidden', border: isNew ? '1.5px solid rgba(14,102,64,0.3)' : '1px solid #e8ede4', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      {c.image_url && (
                        <div style={{ position: 'relative', overflow: 'hidden', maxHeight: 220 }}>
                          <img src={c.image_url} alt="" onClick={() => setLightbox(c.image_url)}
                            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} />
                          <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 8, backdropFilter: 'blur(4px)' }}>
                            tap to expand
                          </div>
                        </div>
                      )}
                      <div style={{ padding: 'clamp(0.7rem,2vw,0.9rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                          <Link href={`/members/${c.user_id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarGradient(c.user_id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: '#fff', fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
                              {initials}
                            </div>
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: '0.3rem' }}>
                              <Link href={`/members/${c.user_id}`} style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.84rem' }}>{name}</Link>
                              {car && <span style={{ background: 'var(--cream-dark)', color: 'var(--text-muted)', fontSize: '0.62rem', padding: '1px 6px', borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap' }}>🚗 {car}</span>}
                              {isNew && <span style={{ background: 'rgba(14,102,64,0.1)', color: 'var(--green-brand)', fontSize: '0.6rem', padding: '1px 6px', borderRadius: 8, fontWeight: 700 }}>NEW</span>}
                              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p style={{ color: 'var(--text-mid)', fontSize: 'clamp(0.82rem,2vw,0.88rem)', lineHeight: 1.55, margin: 0 }}>{c.message}</p>
                          </div>
                          {isOwn && (
                            <button className="gb-del" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '0.8rem', padding: '2px', flexShrink: 0 }} title="Delete">🗑</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Show more / less */}
              {hidden > 0 && !showAll && (
                <button onClick={() => setShowAll(true)} style={{ width: '100%', marginTop: '0.75rem', padding: '0.6rem', background: 'transparent', border: '1px dashed #d1d5db', borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Show {hidden} more post{hidden > 1 ? 's' : ''} ↓
                </button>
              )}
              {showAll && comments.length > PREVIEW_COUNT && (
                <button onClick={() => setShowAll(false)} style={{ width: '100%', marginTop: '0.75rem', padding: '0.6rem', background: 'transparent', border: '1px dashed #d1d5db', borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Show less ↑
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', cursor: 'zoom-out' }}>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 20, right: 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 40, height: 40, color: '#fff', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}
    </>
  )
}
