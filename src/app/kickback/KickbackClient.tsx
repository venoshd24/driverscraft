'use client'
// src/app/kickback/KickbackClient.tsx

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function daysUntil(d: string) {
  const now = new Date(); now.setHours(0,0,0,0)
  const diff = Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today!'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

function MeetCard({ meet, userId, isRsvped }: { meet: any; userId: string | null; isRsvped: boolean }) {
  const [rsvped, setRsvped] = useState(isRsvped)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggleRsvp() {
    if (!userId) {
      showToast('🔒 Sign in to RSVP')
      router.push('/auth/login?redirect=/kickback')
      return
    }
    setLoading(true)
    const sb = createClient()
    if (rsvped) {
      await sb.from('meet_rsvps').delete().eq('meet_id', meet.id).eq('user_id', userId)
      setRsvped(false)
      showToast('👋 RSVP cancelled')
    } else {
      await sb.from('meet_rsvps').insert({ meet_id: meet.id, user_id: userId })
      setRsvped(true)
      showToast('✅ You\'re in! See you there.')
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      border: rsvped ? '2px solid var(--green-brand)' : '1px solid #e2ead9',
      boxShadow: rsvped ? '0 4px 24px rgba(14,102,64,0.12)' : '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Poster */}
      {meet.poster_url ? (
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
          <Image src={meet.poster_url} alt={meet.title} fill style={{ objectFit: 'cover' }} sizes="400px" />
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--green-brand)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
            {daysUntil(meet.date)}
          </div>
          {rsvped && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: '#fff', color: 'var(--green-brand)', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800, border: '1.5px solid var(--green-brand)' }}>
              ✓ Going
            </div>
          )}
        </div>
      ) : (
        <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, var(--green-deep), #1a4a35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <span style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🚗</span>
          <span style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.82rem' }}>Poster coming soon</span>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent)', color: '#1a1a1a', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
            {daysUntil(meet.date)}
          </div>
          {rsvped && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800 }}>
              ✓ Going
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>{meet.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>📅</span><span>{formatDate(meet.date)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>📍</span><span>{meet.location}</span>
          </div>
        </div>
        {meet.description && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>{meet.description}</p>
        )}

        {/* RSVP button */}
        <button
          onClick={toggleRsvp}
          disabled={loading}
          style={{
            width: '100%', padding: '0.75rem',
            borderRadius: 8, border: rsvped ? '2px solid var(--green-brand)' : '2px solid #e2ead9',
            background: rsvped ? 'rgba(14,102,64,0.08)' : '#fff',
            color: rsvped ? 'var(--green-brand)' : 'var(--text-dark)',
            fontWeight: 700, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '…' : rsvped ? '✓ I\'m Going — Cancel RSVP' : '+ Count Me In'}
        </button>

        {!userId && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            <a href="/auth/login?redirect=/kickback" style={{ color: 'var(--green-brand)', fontWeight: 600 }}>Sign in</a> to RSVP
          </p>
        )}
      </div>
    </div>
  )
}

export default function KickbackClient({ upcoming, past, userId, rsvpedIds }: {
  upcoming: any[]
  past: any[]
  userId: string | null
  rsvpedIds: string[]
}) {
  const rsvpSet = new Set(rsvpedIds)

  return (
    <div style={{ background: 'var(--cream)', minHeight: '60vh', padding: '4rem clamp(1.5rem,6vw,6rem)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Upcoming */}
        <section style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
              Upcoming Meets
            </h2>
            {upcoming.length > 0 && (
              <span style={{ background: 'var(--green-brand)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                {upcoming.length}
              </span>
            )}
          </div>

          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 16, border: '1px solid #e2ead9' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No upcoming meets yet.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Check back soon — we're always cooking.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {upcoming.map(meet => (
                <MeetCard key={meet.id} meet={meet} userId={userId} isRsvped={rsvpSet.has(meet.id)} />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em', marginBottom: '2rem', opacity: 0.5 }}>
              Past Meets
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {past.map(meet => (
                <div key={meet.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2ead9', opacity: 0.7 }}>
                  {meet.poster_url ? (
                    <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', filter: 'grayscale(25%)' }}>
                      <Image src={meet.poster_url} alt={meet.title} fill style={{ objectFit: 'cover' }} sizes="300px" />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600 }}>Past</div>
                    </div>
                  ) : (
                    <div style={{ aspectRatio: '4/3', background: '#e2ead9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>🏁</span>
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.4rem' }}>{meet.title}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📅 {formatDate(meet.date)}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📍 {meet.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
