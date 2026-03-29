// src/app/members/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export const revalidate = 60

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [
    { data: profile },
    { data: rsvps },
    { data: comments },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('meet_rsvps')
      .select('meet_id, car_meets(id, title, date, location)')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false }),
    supabase.from('meet_comments')
      .select('id, message, image_url, created_at, car_meets(title)')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  if (!profile) notFound()

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'driversCraft Member'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const joinYear = new Date(profile.created_at).getFullYear()
  const meetsAttended = rsvps?.length || 0

  return (
    <>
      <div style={{ background: 'var(--green-deep)', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>

        {/* Hero */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,6vw,3rem) 0' }}>

          {/* Back */}
          <Link href="/kickback" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(240,245,236,0.45)', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '2rem' }}>
            ← Back to Kickback
          </Link>

          {/* Profile card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 16, padding: 'clamp(1.5rem,4vw,2.5rem)', marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #0e6640, #1a4a35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', color: '#f0f5ec', fontWeight: 700,
                border: '2px solid rgba(200,168,75,0.3)',
              }}>{initials}</div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900, color: '#f0f5ec', lineHeight: 1.1, marginBottom: '0.4rem' }}>
                  {displayName}
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span style={{ background: 'rgba(200,168,75,0.1)', color: 'var(--accent)', border: '1px solid rgba(200,168,75,0.25)', padding: '2px 10px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Member since {joinYear}
                  </span>
                  {meetsAttended > 0 && (
                    <span style={{ background: 'rgba(14,102,64,0.2)', color: '#2d8a5e', border: '1px solid rgba(14,102,64,0.3)', padding: '2px 10px', borderRadius: 2, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      🚗 {meetsAttended} meet{meetsAttended > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {profile.bio && (
                  <p style={{ color: 'rgba(240,245,236,0.6)', fontSize: '0.92rem', lineHeight: 1.65, fontStyle: 'italic' }}>
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            {(profile.car || profile.car_year || profile.favourite_driver || profile.location) && (
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {(profile.car || profile.car_year) && (
                  <Detail icon="🚗" label="Ride" value={[profile.car_year, profile.car].filter(Boolean).join(' ')} />
                )}
                {profile.favourite_driver && (
                  <Detail icon="🏎" label="Favourite Driver" value={profile.favourite_driver} />
                )}
                {profile.location && (
                  <Detail icon="📍" label="Based in" value={profile.location} />
                )}
              </div>
            )}
          </div>

          {/* Meets attended */}
          {rsvps && rsvps.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.35)', marginBottom: '0.85rem' }}>
                Meets Attended
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {rsvps.slice(0, 5).map((r: any) => (
                  <div key={r.meet_id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1rem' }}>🏁</span>
                    <div>
                      <div style={{ color: '#f0f5ec', fontSize: '0.88rem', fontWeight: 600 }}>{r.car_meets?.title || 'Kickback Meet'}</div>
                      {r.car_meets?.date && (
                        <div style={{ color: 'rgba(240,245,236,0.4)', fontSize: '0.72rem', marginTop: 2 }}>
                          {(() => { const [y,m,d] = r.car_meets.date.slice(0,10).split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent guestbook posts */}
          {comments && comments.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.35)', marginBottom: '0.85rem' }}>
                Guestbook Posts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {comments.map((c: any) => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                    {c.image_url && (
                      <img src={c.image_url} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ padding: '0.85rem 1rem' }}>
                      {c.car_meets?.title && (
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.35rem' }}>
                          {c.car_meets.title}
                        </div>
                      )}
                      <p style={{ color: 'rgba(240,245,236,0.75)', fontSize: '0.88rem', lineHeight: 1.55 }}>{c.message}</p>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(240,245,236,0.3)', marginTop: '0.5rem' }}>
                        {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}

function Detail({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.3)', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ color: '#f0f5ec', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon} {value}
      </div>
    </div>
  )
}
