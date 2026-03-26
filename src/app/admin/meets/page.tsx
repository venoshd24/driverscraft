'use client'
// src/app/admin/meets/page.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { showToast } from '@/components/ui/Toast'

export default function AdminMeetsPage() {
  const [meets, setMeets] = useState<any[]>([])
  const [rsvps, setRsvps] = useState<Record<string, any[]>>({})
  const [expandedRsvp, setExpandedRsvp] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const sb = createClient()
    const { data: meetsData } = await sb
      .from('car_meets').select('*').order('date', { ascending: false })

    // Fetch RSVPs without join
    const { data: rsvpData } = await sb
      .from('meet_rsvps')
      .select('meet_id, user_id, created_at')

    // Get unique user_ids and fetch their profiles separately
    const userIds = [...new Set((rsvpData || []).map((r: any) => r.user_id))]
    const { data: profilesData } = userIds.length > 0
      ? await sb.from('profiles').select('id, first_name, last_name').in('id', userIds)
      : { data: [] }

    const profileMap: Record<string, any> = {}
    for (const p of profilesData || []) profileMap[p.id] = p

    // Group RSVPs by meet with profile info
    const grouped: Record<string, any[]> = {}
    for (const r of rsvpData || []) {
      if (!grouped[r.meet_id]) grouped[r.meet_id] = []
      grouped[r.meet_id].push({ ...r, profile: profileMap[r.user_id] || null })
    }

    setMeets(meetsData || [])
    setRsvps(grouped)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteMeet(id: string) {
    if (!confirm('Delete this meet? All RSVPs will also be deleted.')) return
    const sb = createClient()
    await sb.from('car_meets').delete().eq('id', id)
    showToast('✅ Meet deleted')
    load()
  }

  const now = new Date(); now.setHours(0,0,0,0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#f0f5ec' }}>Kickback Meets</h1>
          <p style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Manage events and view RSVPs</p>
        </div>
        <Link href="/admin/meets/new" style={{
          background: '#0e6640', color: '#f0f5ec', textDecoration: 'none',
          padding: '0.65rem 1.25rem', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem',
        }}>+ New Meet</Link>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(240,245,236,0.3)', padding: '3rem', textAlign: 'center' }}>Loading…</div>
      ) : meets.length === 0 ? (
        <div style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(240,245,236,0.4)' }}>No meets yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {meets.map(meet => {
            const isPast = new Date(meet.date) < now
            const meetRsvps = rsvps[meet.id] || []
            const isExpanded = expandedRsvp === meet.id

            return (
              <div key={meet.id} style={{ background: '#121d17', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                {/* Meet row */}
                <div style={{ padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: isPast ? 0.7 : 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#0f1a14', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {meet.poster_url
                      ? <img src={meet.poster_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '1.5rem' }}>🚗</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#f0f5ec', fontSize: '0.95rem' }}>{meet.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(240,245,236,0.4)', marginTop: 2 }}>
                      {new Date(meet.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {meet.location}
                    </div>
                  </div>

                  {/* RSVP count badge */}
                  <button
                    onClick={() => setExpandedRsvp(isExpanded ? null : meet.id)}
                    style={{
                      background: meetRsvps.length > 0 ? 'rgba(14,102,64,0.2)' : 'rgba(255,255,255,0.05)',
                      border: 'none', borderRadius: 20, padding: '4px 12px',
                      color: meetRsvps.length > 0 ? '#2d8a5e' : 'rgba(240,245,236,0.3)',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    👥 {meetRsvps.length} RSVP{meetRsvps.length !== 1 ? 's' : ''}
                    <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700,
                    background: isPast ? 'rgba(255,255,255,0.07)' : 'rgba(14,102,64,0.2)',
                    color: isPast ? 'rgba(240,245,236,0.4)' : '#2d8a5e',
                    flexShrink: 0,
                  }}>
                    {isPast ? 'Past' : 'Upcoming'}
                  </span>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link href={`/admin/meets/edit/${meet.id}`} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '0.35rem 0.7rem', color: '#f0f5ec', fontSize: '0.75rem', textDecoration: 'none' }}>Edit</Link>
                    <button onClick={() => deleteMeet(meet.id)} style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 5, padding: '0.35rem 0.7rem', color: '#e74c3c', fontSize: '0.75rem', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>

                {/* RSVP list */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.25rem' }}>
                    {meetRsvps.length === 0 ? (
                      <p style={{ color: 'rgba(240,245,236,0.3)', fontSize: '0.82rem' }}>No RSVPs yet.</p>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.35)', marginBottom: '0.75rem' }}>
                          Attending ({meetRsvps.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {meetRsvps.map((r: any) => {
                            const p = r.profile
                            const name = p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Anonymous' : 'Anonymous'
                            const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
                            return (
                              <div key={r.user_id} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(255,255,255,0.05)', borderRadius: 20,
                                padding: '5px 12px 5px 5px',
                              }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--green-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800, color: '#fff' }}>
                                  {initials}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'rgba(240,245,236,0.7)' }}>{name}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
