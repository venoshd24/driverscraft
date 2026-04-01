// src/app/members/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import MemberGallery from './MemberGallery'

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
      .order('created_at', { ascending: false }),
  ])

  if (!profile) notFound()

  const p = profile as any
  const displayName = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'driversCraft Member'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const joinYear = new Date(p.created_at).getFullYear()
  const meetsAttended = rsvps?.length || 0
  const carName = [p.car_year, p.car].filter(Boolean).join(' ')

  // Photos from guestbook posts
  const photos = (comments || []).filter((c: any) => c.image_url).map((c: any) => ({ url: c.image_url, caption: c.message, meet: c.car_meets?.title }))
  if (p.car_photo_url) photos.unshift({ url: p.car_photo_url, caption: carName || 'My build', meet: null })

  const specs = [
    { label: 'Engine', value: p.engine },
    { label: 'Power / Tune', value: p.power },
    { label: 'Suspension', value: p.suspension },
    { label: 'Wheels', value: p.wheels },
    { label: 'Tyres', value: p.tyres },
    { label: 'Exterior', value: p.exterior_mods },
    { label: 'Other Mods', value: p.other_mods },
  ].filter(s => s.value)

  return (
    <>
      <div style={{ background: '#0a1510', minHeight: '100vh' }}>

        {/* Hero — full-bleed car photo or gradient */}
        <div style={{ position: 'relative', minHeight: 'clamp(280px,45vw,520px)', overflow: 'hidden' }}>
          {p.car_photo_url ? (
            <>
              <img src={p.car_photo_url} alt={carName} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a1510 0%, rgba(10,21,16,0.4) 60%, rgba(10,21,16,0.15) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,21,16,0.6) 0%, transparent 60%)' }} />
            </>
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d1f17 0%, #1a3528 50%, #0e6640 100%)', opacity: 0.8 }} />
          )}

          {/* Nav */}
          <div style={{ position: 'absolute', top: 'calc(var(--nav-height) + 1rem)', left: 0, right: 0, padding: '0 clamp(1.25rem,5vw,4rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <Link href="/kickback" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(240,245,236,0.6)', fontSize: '0.82rem', textDecoration: 'none', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>
              ← Kickback
            </Link>
          </div>

          {/* Identity overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem,4vw,3rem) clamp(1.25rem,5vw,4rem)', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(1rem,3vw,1.5rem)', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ width: 'clamp(56px,10vw,80px)', height: 'clamp(56px,10vw,80px)', borderRadius: '50%', background: 'linear-gradient(135deg, #0e6640, #1a4a35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1.1rem,3vw,1.6rem)', color: '#f0f5ec', fontWeight: 700, border: '3px solid rgba(200,168,75,0.5)', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 className="font-serif" style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 900, color: '#f0f5ec', lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  {displayName}
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {carName && <Chip label={`🚗 ${carName}`} accent />}
                  {p.location && <Chip label={`📍 ${p.location}`} />}
                  <Chip label={`Member since ${joinYear}`} />
                  {meetsAttended > 0 && <Chip label={`🏁 ${meetsAttended} meet${meetsAttended > 1 ? 's' : ''}`} green />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(1.5rem,4vw,3rem) clamp(1.25rem,5vw,2.5rem) 4rem' }}>

          {/* Bio */}
          {p.bio && (
            <div style={{ marginBottom: '2.5rem', padding: '1.25rem clamp(1rem,3vw,1.75rem)', borderLeft: '3px solid var(--accent)', background: 'rgba(200,168,75,0.05)' }}>
              <p style={{ color: 'rgba(240,245,236,0.75)', fontSize: 'clamp(0.92rem,2vw,1.05rem)', lineHeight: 1.75, fontStyle: 'italic', margin: 0 }}>
                "{p.bio}"
              </p>
              {p.favourite_driver && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'rgba(240,245,236,0.4)' }}>
                  Favourite driver: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{p.favourite_driver}</span>
                </div>
              )}
            </div>
          )}

          {/* Photo gallery */}
          {photos.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <SectionLabel>📸 Gallery</SectionLabel>
              <MemberGallery photos={photos} />
            </div>
          )}

          {/* Spec sheet */}
          {specs.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <SectionLabel>🔧 Build Spec Sheet</SectionLabel>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                {specs.map((s, i) => (
                  <div key={s.label} style={{ display: 'grid', gridTemplateColumns: 'clamp(100px,30%,160px) 1fr', borderBottom: i < specs.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ padding: 'clamp(0.75rem,2vw,1rem) clamp(0.85rem,2vw,1.25rem)', background: 'rgba(255,255,255,0.03)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.35)', display: 'flex', alignItems: 'center' }}>
                      {s.label}
                    </div>
                    <div style={{ padding: 'clamp(0.75rem,2vw,1rem) clamp(0.85rem,2vw,1.25rem)', color: '#f0f5ec', fontSize: 'clamp(0.82rem,2vw,0.92rem)', lineHeight: 1.55, display: 'flex', alignItems: 'center' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meets attended */}
          {rsvps && rsvps.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <SectionLabel>🏁 Meets Attended</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px,40vw,260px), 1fr))', gap: '0.75rem' }}>
                {rsvps.map((r: any) => (
                  <div key={r.meet_id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 'clamp(0.75rem,2vw,1rem)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🏁</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#f0f5ec', fontSize: 'clamp(0.8rem,2vw,0.88rem)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.car_meets?.title || 'Kickback Meet'}</div>
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

          {/* Guestbook posts (text-only) */}
          {comments && comments.filter((c: any) => c.message).length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <SectionLabel>💬 Guestbook Posts</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(comments as any[]).slice(0, 4).map((c: any) => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 'clamp(0.75rem,2vw,1rem) clamp(0.85rem,2vw,1.1rem)' }}>
                    {c.car_meets?.title && (
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.3rem' }}>{c.car_meets.title}</div>
                    )}
                    <p style={{ color: 'rgba(240,245,236,0.7)', fontSize: 'clamp(0.82rem,2vw,0.88rem)', lineHeight: 1.55, margin: 0 }}>{c.message}</p>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(240,245,236,0.28)', marginTop: '0.4rem' }}>
                      {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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

function Chip({ label, accent, green }: { label: string; accent?: boolean; green?: boolean }) {
  return (
    <span style={{
      background: accent ? 'rgba(200,168,75,0.15)' : green ? 'rgba(14,102,64,0.2)' : 'rgba(255,255,255,0.08)',
      color: accent ? 'var(--accent)' : green ? '#2d8a5e' : 'rgba(240,245,236,0.65)',
      border: `1px solid ${accent ? 'rgba(200,168,75,0.3)' : green ? 'rgba(14,102,64,0.35)' : 'rgba(255,255,255,0.12)'}`,
      padding: 'clamp(2px,0.5vw,4px) clamp(8px,1.5vw,12px)', borderRadius: 20,
      fontSize: 'clamp(0.6rem,1.5vw,0.7rem)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
      whiteSpace: 'nowrap' as const,
    }}>{label}</span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(0.75rem,2vw,1rem)' }}>
      <div style={{ fontSize: 'clamp(0.7rem,1.5vw,0.78rem)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,245,236,0.4)' }}>{children}</div>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}
