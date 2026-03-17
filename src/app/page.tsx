// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NewsletterStrip from '@/components/ui/NewsletterStrip'
import Footer from '@/components/layout/Footer'
import MerchCarousel from '@/components/home/MerchCarousel'
import DriversEdge from '@/components/home/DriversEdge'

export const revalidate = 60 // revalidate every 60 seconds

export default async function HomePage() {
  const supabase = createClient()

  const [{ data: products }, { data: posts }, { data: latestPosts }] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).limit(9),
    supabase.from('posts').select('*').eq('published', true).order('view_count', { ascending: false }).order('published_at', { ascending: false }).order('id', { ascending: true }).limit(5),
    supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3),
  ])

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

      {/* ── MERCH CAROUSEL ── */}
      <MerchCarousel products={products || []} />

      {/* ── DRIVERS EDGE ── */}
      <DriversEdge posts={posts || []} latestPosts={latestPosts || []} />

      <NewsletterStrip />
      <Footer />
    </>
  )
}
