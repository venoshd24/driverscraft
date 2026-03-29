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
  profiles: {
    first_name: string | null
    last_name: string | null
    car: string | null
    car_year: string | null
  } | null
}

export default function Guestbook({
  meetId,
  meetTitle,
  userId,
  isRsvped,
}: {
  meetId: string
  meetTitle: string
  userId: string | null
  isRsvped: boolean
}) {
  const [comments, setComments]   = useState<Comment[]>([])
  const [loading, setLoading]     = useState(true)
  const [message, setMessage]     = useState('')
  const [image, setImage]         = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const sb = createClient()

  async function loadComments() {
    const { data } = await sb
      .from('meet_comments')
      .select(`
        id, message, image_url, created_at, user_id,
        profiles ( first_name, last_name, car, car_year )
      `)
      .eq('meet_id', meetId)
      .order('created_at', { ascending: false })
    setComments((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { loadComments() }, [meetId])

  // Real-time updates
  useEffect(() => {
    const channel = sb.channel(`comments:${meetId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'meet_comments',
        filter: `meet_id=eq.${meetId}`,
      }, () => loadComments())
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [meetId])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('❌ Image must be under 5MB'); return }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImage(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit() {
    if (!userId) { showToast('🔒 Sign in to post'); return }
    if (!isRsvped) { showToast('🎟 RSVP to this meet first!'); return }
    if (!message.trim()) { showToast('✏️ Write something first'); return }
    if (message.length > 300) { showToast('❌ Keep it under 300 characters'); return }

    setSubmitting(true)
    let image_url: string | null = null

    // Upload image if selected
    if (image) {
      const ext = image.name.split('.').pop()
      const path = `${userId}/${meetId}-${Date.now()}.${ext}`
      const { error: uploadErr } = await sb.storage
        .from('meet-comments')
        .upload(path, image, { upsert: false })
      if (uploadErr) {
        showToast('❌ Image upload failed')
        setSubmitting(false)
        return
      }
      const { data: urlData } = sb.storage.from('meet-comments').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { error } = await sb.from('meet_comments').insert({
      meet_id: meetId,
      user_id: userId,
      message: message.trim(),
      image_url,
    })

    if (error) {
      showToast('❌ Failed to post')
    } else {
      showToast('✅ Posted!')
      setMessage('')
      removeImage()
      loadComments()
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId)
    const { error } = await sb.from('meet_comments').delete().eq('id', commentId)
    if (error) showToast('❌ Could not delete')
    else { showToast('🗑 Deleted'); loadComments() }
    setDeletingId(null)
  }

  const charCount = message.length
  const overLimit = charCount > 300

  return (
    <div style={{ marginTop: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h3 className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
          Guestbook
        </h3>
        <span style={{ background: 'var(--green-brand)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
          {comments.length}
        </span>
      </div>

      {/* Compose box */}
      {userId ? (
        isRsvped ? (
          <div style={{
            background: '#fff', border: '1px solid #e2ead9', borderRadius: 12,
            padding: '1.25rem', marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Share a thought, hype the meet, show your car… 🚗"
              rows={3}
              style={{
                width: '100%', border: 'none', outline: 'none', resize: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
                color: 'var(--text-dark)', lineHeight: 1.6,
                background: 'transparent', boxSizing: 'border-box',
              }}
            />

            {/* Image preview */}
            {imagePreview && (
              <div style={{ position: 'relative', marginTop: '0.75rem', display: 'inline-block' }}>
                <img src={imagePreview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, display: 'block', objectFit: 'cover' }} />
                <button onClick={removeImage} style={{
                  position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                  borderRadius: '50%', width: 26, height: 26, cursor: 'pointer',
                  fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2ead9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Image upload button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  title="Attach a photo"
                  style={{ background: 'none', border: '1px solid #e2ead9', borderRadius: 6, padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  📷 Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                <span style={{ fontSize: '0.72rem', color: overLimit ? '#e74c3c' : 'var(--text-muted)' }}>
                  {charCount}/300
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !message.trim() || overLimit}
                className="btn btn-green btn-sm"
                style={{ opacity: submitting || !message.trim() || overLimit ? 0.5 : 1 }}
              >
                {submitting ? 'Posting…' : 'Post →'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(14,102,64,0.06)', border: '1px dashed rgba(14,102,64,0.25)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            🎟 <strong style={{ color: 'var(--text-dark)' }}>RSVP to this meet</strong> to leave a guestbook post.
          </div>
        )
      ) : (
        <div style={{ background: 'rgba(14,102,64,0.06)', border: '1px dashed rgba(14,102,64,0.25)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <Link href="/auth/login?redirect=/kickback" style={{ color: 'var(--green-brand)', fontWeight: 600 }}>Sign in</Link> and RSVP to leave a guestbook post.
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div>
      ) : comments.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', background: '#fff', borderRadius: 10, border: '1px solid #e2ead9' }}>
          No posts yet — be the first to sign the guestbook! 🏁
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {comments.map(c => {
            const profile = c.profiles
            const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'driversCraft Member'
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            const car = [profile?.car_year, profile?.car].filter(Boolean).join(' ')
            const isOwn = c.user_id === userId

            return (
              <div key={c.id} style={{
                background: '#fff', border: '1px solid #e2ead9',
                borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                {/* Image */}
                {c.image_url && (
                  <img src={c.image_url} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
                )}

                <div style={{ padding: '1rem' }}>
                  {/* Author row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.65rem' }}>
                    <Link href={`/members/${c.user_id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0e6640, #1a4a35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', color: '#f0f5ec', fontWeight: 700,
                      }}>{initials}</div>
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/members/${c.user_id}`} style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.88rem', display: 'block' }}>
                        {name}
                      </Link>
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {car && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🚗 {car}</span>}
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        title="Delete post"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', opacity: deletingId === c.id ? 0.4 : 0.6, fontSize: '0.8rem', padding: '4px 6px', flexShrink: 0 }}
                      >
                        🗑
                      </button>
                    )}
                  </div>

                  {/* Message */}
                  <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {c.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
