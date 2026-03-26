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
        <div style={{ background: '#0d1f17', padding: '3rem clamp(1.5rem,5vw,5rem)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: '2rem', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 'clamp(1.25rem,3vw,2rem)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 0 }}>
                {/* Countdown badge */}
                <div style={{
                  background: 'var(--accent)', color: '#1a1a1a',
                  borderRadius: 12, padding: '0.75rem 1.25rem',
                  textAlign: 'center', flexShrink: 0,
                }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.2rem' }}>Next Meet</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>{daysUntil(nextMeet.date)}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.3rem' }}>Kickback</div>
                  <h3 className="font-serif" style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 800, color: '#f0f5ec', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextMeet.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(240,245,236,0.45)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>📅 {new Date(nextMeet.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>📍 {nextMeet.location}</span>
                  </div>
                </div>
              </div>
              <Link href="/kickback" style={{
                background: 'var(--green-brand)', color: '#fff', textDecoration: 'none',
                padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                View & RSVP →
              </Link>
            </div>
          </div>
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