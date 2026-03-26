// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import NewsletterStrip from '@/components/ui/NewsletterStrip'
import Footer from '@/components/layout/Footer'
import MerchCarousel from '@/components/home/MerchCarousel'
import DriversEdge from '@/components/home/DriversEdge'

export const revalidate = 60

export default async function HomePage() {
  const supabase = createClient()

  const now = new Date(); now.setHours(0,0,0,0)

  const [{ data: products }, { data: posts }, { data: latestPosts }, { data: meets }] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).limit(9),
    supabase.from('posts').select('*').eq('published', true).order('view_count', { ascending: false }).order('published_at', { ascending: false }).order('id', { ascending: true }).limit(5),
    supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('car_meets').select('*').gte('date', now.toISOString().slice(0,10)).order('date', { ascending: true }).limit(1),
  ])

  const nextMeet = meets?.[0] || null

  function daysUntil(d: string) {
    const diff = Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today!'
    if (diff === 1) return 'Tomorrow'
    return `In ${diff} days`
  }

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-section">
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, rgba(10,28,20,0.85) 0%, rgba(10,28,20,0.5) 60%, rgba(10,28,20,0.2) 100%)',
        }} />
        <div className="animate-fade-up hero-left" style={{ gridColumn: '1 / -1' }}>
          <h1 className="font-serif" style={{
            fontSize: 'clamp(2.8rem, 6vw, 6rem)', fontWeight: 900, lineHeight: 1.0,
            color: 'var(--cream)', marginBottom: '2rem', letterSpacing: '-0.03em',
          }}>
            Built for<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>those who</em><br />
            live to drive.
          </h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary btn-lg">Shop Merch</Link>
            <Link href="/blog" className="btn btn-outline-light btn-lg">driversEdge</Link>
          </div>
        </div>
      </section>

      {/* ── NEXT KICKBACK ── */}
      {nextMeet && (
        <div style={{ background: '#070f0a' }}>
          <a href="/kickback" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              position: 'relative', overflow: 'hidden',
              minHeight: 'clamp(260px, 35vw, 440px)',
              display: 'flex', alignItems: 'center',
            }}>
              {/* Full-bleed background poster */}
              {nextMeet.poster_url ? (
                <>
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <img src={nextMeet.poster_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
                  </div>
                  {/* Multi-directional gradient */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(7,15,10,0.97) 0%, rgba(7,15,10,0.82) 45%, rgba(7,15,10,0.5) 100%)' }} />
                </>
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d1f17 0%, #1a3a28 100%)' }} />
              )}

              {/* Decorative racing line */}
              <div style={{ position: 'absolute', top: 0, right: '25%', width: 2, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(200,168,75,0.3), transparent)', pointerEvents: 'none' }} />

              {/* Content */}
              <div className="kickback-banner-content" style={{ position: 'relative', zIndex: 1, width: '100%', padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,6vw,6rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                    <div style={{ width: 28, height: 2, background: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>Kickback · Next Meet</span>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif" style={{
                    fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontWeight: 900,
                    color: '#f0f5ec', lineHeight: 1.05, letterSpacing: '-0.02em',
                    marginBottom: '1rem', maxWidth: 600,
                  }}>{nextMeet.title}</h2>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'rgba(240,245,236,0.55)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📅 {new Date(nextMeet.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <span style={{ color: 'rgba(240,245,236,0.55)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📍 {nextMeet.location}
                    </span>
                  </div>

                  {/* CTA */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--green-brand)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>
                    View & RSVP →
                  </div>
                </div>

                {/* Countdown pill */}
                <div style={{
                  flexShrink: 0, textAlign: 'center',
                  background: 'var(--accent)', borderRadius: 16,
                  padding: 'clamp(1rem,2vw,1.5rem) clamp(1.25rem,2.5vw,2rem)',
                  boxShadow: '0 8px 32px rgba(200,168,75,0.25)',
                }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(26,26,26,0.6)', marginBottom: '0.4rem' }}>Countdown</div>
                  <div style={{ fontSize: 'clamp(1.4rem,3vw,2.2rem)', fontWeight: 900, fontFamily: 'DM Mono, monospace', color: '#1a1a1a', lineHeight: 1 }}>{daysUntil(nextMeet.date)}</div>
                </div>
              </div>
            </div>
          </a>
        </div>
      )}

      {/* ── MERCH CAROUSEL ── */}
      <MerchCarousel products={products || []} />

      {/* ── DRIVERS EDGE ── */}
      <DriversEdge posts={posts || []} latestPosts={latestPosts || []} />

      <NewsletterStrip />
      <Footer />
    </>
  )
}
