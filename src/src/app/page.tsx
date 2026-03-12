// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProductCard from '@/components/ui/ProductCard'
import BlogCard from '@/components/ui/BlogCard'
import NewsletterStrip from '@/components/ui/NewsletterStrip'
import Footer from '@/components/layout/Footer'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default async function HomePage() {
  const supabase = createClient()

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).limit(5),
    supabase.from('posts').select('*').eq('published', true).order('published_at', { ascending: false }).limit(4),
  ])

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Photo background */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />
        {/* Dark gradient overlay so text stays readable */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, rgba(10,28,20,0.82) 0%, rgba(10,28,20,0.45) 60%, rgba(10,28,20,0.15) 100%)',
        }} />

        {/* Content — centred vertically, left-aligned */}
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
            <Link href="/blog" className="btn btn-outline-light btn-lg">Read Stories</Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED MERCH ── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="section-header">
          <div>
            <div className="section-label">Gear Up</div>
            <h2 className="section-title">Featured <em>Merch</em></h2>
            <p className="section-sub">Limited drops, race-day quality. Designed for the paddock and the street.</p>
          </div>
          <Link href="/shop" className="btn btn-green">View All →</Link>
        </div>
        <div className="products-grid">
          {(products || []).map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 80} direction="up">
              <ProductCard product={p} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-label">Pit Lane</div>
            <h2 className="section-title">Latest <em>Stories</em></h2>
            <p className="section-sub">Race analysis, driver profiles, and everything in between.</p>
          </div>
          <Link href="/blog" className="btn btn-dark">All Stories →</Link>
        </div>
        <div className="blog-grid">
          {(posts || []).map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 100} direction="up">
              <BlogCard post={post} featured={i === 0} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <NewsletterStrip />
      <Footer />
    </>
  )
}
