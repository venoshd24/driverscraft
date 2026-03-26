'use client'
// src/app/kickback/KickbackClient.tsx

import { useState, useRef, useCallback } from 'react'
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

// ── HERO MEET (first upcoming) ──────────────────────────────────────────────
function HeroMeet({ meet, userId, isRsvped }: { meet: any; userId: string | null; isRsvped: boolean }) {
  const [rsvped, setRsvped] = useState(isRsvped)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

  async function toggleRsvp() {
    if (!userId) {
      showToast('🔒 Sign in to RSVP for this meet')
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
  }

  return (
    <div style={{ marginBottom: '4rem' }}>
      {/* Hero image — full width, clickable */}
      <div
        onClick={toggleRsvp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', width: '100%', borderRadius: 20, overflow: 'hidden',
          cursor: loading ? 'not-allowed' : 'pointer',
          aspectRatio: '16/7',
          background: 'linear-gradient(135deg, var(--green-deep), #1a4a35)',
          boxShadow: rsvped
            ? '0 8px 48px rgba(14,102,64,0.35)'
            : '0 8px 32px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.3s',
        }}
      >
        {meet.poster_url ? (
          <Image src={meet.poster_url} alt={meet.title} fill style={{ objectFit: 'cover' }} sizes="100vw" priority />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '6rem', opacity: 0.2 }}>🚗</span>
          </div>
        )}

        {/* Dark overlay — always */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)' }} />

        {/* Hover overlay — green tint with RSVP prompt */}
        <div style={{
          position: 'absolute', inset: 0,
          background: rsvped
            ? 'rgba(14,102,64,0.35)'
            : 'rgba(14,102,64,0.55)',
          opacity: hovered || rsvped ? 1 : 0,
          transition: 'opacity 0.25s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {!rsvped && hovered && (
            <div style={{ textAlign: 'center', transform: 'translateY(0)', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏁</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontFamily: 'Playfair Display, serif' }}>
                {userId ? 'Count Me In' : 'Sign In to RSVP'}
              </div>
            </div>
          )}
          {rsvped && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontFamily: 'Playfair Display, serif' }}>You're Going!</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Click to cancel RSVP</div>
            </div>
          )}
        </div>

        {/* Top badges */}
        <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 8 }}>
          <span style={{ background: 'var(--accent)', color: '#1a1a1a', padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>
            {daysUntil(meet.date)}
          </span>
          <span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
            Next Meet
          </span>
        </div>

        {/* RSVP status badge */}
        {rsvped && (
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'var(--green-brand)', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, border: '1.5px solid rgba(255,255,255,0.3)' }}>
            ✓ Going
          </div>
        )}

        {/* Bottom info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.25rem,3vw,2rem)' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {meet.title}
          </h2>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>📅 {formatDate(meet.date)}</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>📍 {meet.location}</span>
          </div>
          {meet.description && (
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginTop: '0.6rem', maxWidth: 600, lineHeight: 1.5 }}>{meet.description}</p>
          )}
        </div>
      </div>

      {/* RSVP CTA below image for non-hoverable (mobile) */}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleRsvp}
          disabled={loading}
          style={{
            padding: '0.75rem 2rem', borderRadius: 8, border: 'none',
            background: rsvped ? 'rgba(14,102,64,0.1)' : 'var(--green-brand)',
            color: rsvped ? 'var(--green-brand)' : '#fff',
            fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
            outline: rsvped ? '2px solid var(--green-brand)' : 'none',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '…' : rsvped ? '✓ You\'re Going — Cancel?' : '+ Count Me In'}
        </button>
        {!userId && (
          <a href="/auth/login?redirect=/kickback" style={{ color: 'var(--green-brand)', fontSize: '0.85rem', fontWeight: 600 }}>
            Sign in to RSVP →
          </a>
        )}
      </div>
    </div>
  )
}

// ── SMALL MEET CARD (rest of upcoming) ─────────────────────────────────────
function SmallMeetCard({ meet, userId, isRsvped }: { meet: any; userId: string | null; isRsvped: boolean }) {
  const [rsvped, setRsvped] = useState(isRsvped)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

  async function toggleRsvp(e: React.MouseEvent) {
    e.stopPropagation()
    if (!userId) {
      showToast('🔒 Sign in to RSVP for this meet')
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
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        border: rsvped ? '2px solid var(--green-brand)' : '1px solid #e2ead9',
        boxShadow: rsvped ? '0 4px 20px rgba(14,102,64,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={toggleRsvp as any}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'linear-gradient(135deg, var(--green-deep), #1a4a35)' }}>
        {meet.poster_url
          ? <Image src={meet.poster_url} alt={meet.title} fill style={{ objectFit: 'cover', transition: 'transform 0.3s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} sizes="400px" />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '3rem', opacity: 0.2 }}>🚗</span></div>
        }
        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0, transition: 'opacity 0.2s',
          opacity: hovered ? 1 : 0,
          background: rsvped ? 'rgba(14,102,64,0.4)' : 'rgba(14,102,64,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
            {rsvped ? '✓ Going — Cancel?' : (userId ? '+ Count Me In' : '🔒 Sign In to RSVP')}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, background: rsvped ? 'var(--green-brand)' : 'var(--accent)', color: rsvped ? '#fff' : '#1a1a1a', padding: '3px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700 }}>
          {rsvped ? '✓ Going' : daysUntil(meet.date)}
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: '1rem' }}>
        <h3 className="font-serif" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>{meet.title}</h3>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {formatDate(meet.date)}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>📍 {meet.location}</div>
      </div>
    </div>
  )
}

// ── MAIN EXPORT ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 6

export default function KickbackClient({ upcoming, past, userId, rsvpedIds }: {
  upcoming: any[]
  past: any[]
  userId: string | null
  rsvpedIds: string[]
}) {
  const [shown, setShown] = useState(PAGE_SIZE)
  const rsvpSet = new Set(rsvpedIds)

  const heroMeet = upcoming[0] || null
  const restMeets = upcoming.slice(1)
  const visibleRest = restMeets.slice(0, shown)
  const hasMore = shown < restMeets.length

  return (
    <div style={{ background: 'var(--cream)', minHeight: '60vh', padding: '3rem clamp(1.5rem,6vw,6rem) 5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Upcoming section */}
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
            <>
              {/* Hero — first meet */}
              {heroMeet && <HeroMeet meet={heroMeet} userId={userId} isRsvped={rsvpSet.has(heroMeet.id)} />}

              {/* Rest of upcoming — grid with infinite scroll */}
              {restMeets.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    More Coming Up
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {visibleRest.map(meet => (
                      <SmallMeetCard key={meet.id} meet={meet} userId={userId} isRsvped={rsvpSet.has(meet.id)} />
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                      <button
                        onClick={() => setShown(s => s + PAGE_SIZE)}
                        style={{
                          background: 'transparent', border: '1.5px solid #d1d5db',
                          borderRadius: 8, padding: '0.7rem 2rem',
                          color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem',
                          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                          transition: 'border-color 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--green-brand)'; (e.currentTarget as HTMLElement).style.color = 'var(--green-brand)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                      >
                        Show More ({restMeets.length - shown} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>

        {/* Past meets */}
        {past.length > 0 && (
          <section>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.02em', marginBottom: '2rem', opacity: 0.5 }}>
              Past Meets
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {past.map(meet => (
                <div key={meet.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2ead9', opacity: 0.7 }}>
                  {meet.poster_url ? (
                    <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', filter: 'grayscale(30%)' }}>
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
